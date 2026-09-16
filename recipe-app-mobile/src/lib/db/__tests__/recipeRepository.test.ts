import type { SQLiteDatabase } from 'expo-sqlite';
import type { CongThuc } from '../../../types/api';
import {
  layCongThucTuCache,
  layLichSuTimKiem,
  luuCongThucVaoCache,
  luuLichSuTimKiem,
  timCongThucTrongCache,
  xoaCongThucKhoiCache,
} from '../recipeRepository';

function taoCongThucMau(vuot?: Partial<CongThuc>): CongThuc {
  return {
    id: 'ct-1',
    ten: 'Phở bò Hà Nội',
    moTa: 'Ngon',
    anhThumbnail: null,
    thoiGianNauPhut: 120,
    thoiGianChuanBiPhut: 30,
    khauPhan: 4,
    tacGia: {
      id: 'u-1',
      email: 'a@b.c',
      tenHienThi: 'Bếp Nhà',
      anhDaiDien: null,
      vaiTro: 'USER',
      trangThai: 'ACTIVE',
    },
    nguyenLieu: [],
    cacBuoc: [],
    dinhDuong: null,
    ngayTao: '2026-01-01T00:00:00.000Z',
    ngayCapNhat: '2026-01-01T00:00:00.000Z',
    ...vuot,
  };
}

function taoDbGia(): SQLiteDatabase & {
  runAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
} {
  return {
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
  } as unknown as SQLiteDatabase & {
    runAsync: jest.Mock;
    getFirstAsync: jest.Mock;
    getAllAsync: jest.Mock;
  };
}

describe('recipeRepository', () => {
  it('lưu công thức vào cache kèm JSON đầy đủ', async () => {
    const db = taoDbGia();
    const congThuc = taoCongThucMau();
    await luuCongThucVaoCache(db, congThuc);

    expect(db.runAsync).toHaveBeenCalledTimes(1);
    const thamSo = db.runAsync.mock.calls[0][1] as unknown[];
    expect(thamSo[0]).toBe('ct-1');
    expect(JSON.parse(thamSo[6] as string)).toEqual(congThuc);
  });

  it('đọc công thức từ cache, null khi chưa có', async () => {
    const db = taoDbGia();
    const congThuc = taoCongThucMau();
    db.getFirstAsync.mockResolvedValueOnce({ duLieuJson: JSON.stringify(congThuc) });
    expect(await layCongThucTuCache(db, 'ct-1')).toEqual(congThuc);

    db.getFirstAsync.mockResolvedValueOnce(null);
    expect(await layCongThucTuCache(db, 'khong-co')).toBeNull();
  });

  it('tìm kiếm trong cache theo tên', async () => {
    const db = taoDbGia();
    const congThuc = taoCongThucMau();
    db.getAllAsync.mockResolvedValueOnce([{ duLieuJson: JSON.stringify(congThuc) }]);

    const ketQua = await timCongThucTrongCache(db, 'phở');
    expect(ketQua).toEqual([congThuc]);
    expect(db.getAllAsync.mock.calls[0][1]).toEqual(['%phở%', 20]);
  });

  it('xóa công thức khỏi cache', async () => {
    const db = taoDbGia();
    await xoaCongThucKhoiCache(db, 'ct-1');
    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM cong_thuc_cache WHERE id = ?', ['ct-1']);
  });

  it('lưu lịch sử tìm kiếm: bỏ trống, khử trùng', async () => {
    const db = taoDbGia();
    await luuLichSuTimKiem(db, '   ');
    expect(db.runAsync).not.toHaveBeenCalled();

    await luuLichSuTimKiem(db, '  phở bò  ');
    expect(db.runAsync).toHaveBeenCalledTimes(2);
    expect(db.runAsync.mock.calls[0]).toEqual(['DELETE FROM lich_su_tim_kiem WHERE tuKhoa = ?', ['phở bò']]);
  });

  it('đọc lịch sử tìm kiếm mới nhất trước', async () => {
    const db = taoDbGia();
    db.getAllAsync.mockResolvedValueOnce([{ tuKhoa: 'bún' }, { tuKhoa: 'phở' }]);
    expect(await layLichSuTimKiem(db)).toEqual(['bún', 'phở']);
  });
});
