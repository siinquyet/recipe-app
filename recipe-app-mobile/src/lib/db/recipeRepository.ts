import type { SQLiteDatabase } from 'expo-sqlite';
import type { CongThuc } from '../../types/api';
import { layDatabase } from './database';

interface DongCache {
  id: string;
  ten: string;
  anhThumbnail: string | null;
  thoiGianNauPhut: number;
  khauPhan: number;
  tacGiaTen: string;
  duLieuJson: string;
  dongBoLuc: string;
}

function giaiMaDong(dong: DongCache): CongThuc {
  return JSON.parse(dong.duLieuJson) as CongThuc;
}

export async function luuCongThucVaoCache(
  db: SQLiteDatabase,
  congThuc: CongThuc,
): Promise<void> {
  const hienTai = new Date().toISOString();
  await db.runAsync(
    `INSERT OR REPLACE INTO cong_thuc_cache
      (id, ten, anhThumbnail, thoiGianNauPhut, khauPhan, tacGiaTen, duLieuJson, dongBoLuc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      congThuc.id,
      congThuc.ten,
      congThuc.anhThumbnail,
      congThuc.thoiGianNauPhut,
      congThuc.khauPhan,
      congThuc.tacGia.tenHienThi,
      JSON.stringify(congThuc),
      hienTai,
    ],
  );
}

export async function layCongThucTuCache(
  db: SQLiteDatabase,
  id: string,
): Promise<CongThuc | null> {
  const dong = await db.getFirstAsync<DongCache>(
    'SELECT * FROM cong_thuc_cache WHERE id = ?',
    [id],
  );
  return dong ? giaiMaDong(dong) : null;
}

export async function timCongThucTrongCache(
  db: SQLiteDatabase,
  tuKhoa: string,
  gioiHan = 20,
): Promise<CongThuc[]> {
  const dong = await db.getAllAsync<DongCache>(
    'SELECT * FROM cong_thuc_cache WHERE ten LIKE ? ORDER BY dongBoLuc DESC LIMIT ?',
    [`%${tuKhoa}%`, gioiHan],
  );
  return dong.map(giaiMaDong);
}

export async function xoaCongThucKhoiCache(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM cong_thuc_cache WHERE id = ?', [id]);
}

export async function luuLichSuTimKiem(db: SQLiteDatabase, tuKhoa: string): Promise<void> {
  const gon = tuKhoa.trim();
  if (!gon) return;
  await db.runAsync('DELETE FROM lich_su_tim_kiem WHERE tuKhoa = ?', [gon]);
  await db.runAsync('INSERT INTO lich_su_tim_kiem (tuKhoa, taoLuc) VALUES (?, ?)', [
    gon,
    new Date().toISOString(),
  ]);
}

export async function layLichSuTimKiem(db: SQLiteDatabase, gioiHan = 10): Promise<string[]> {
  const dong = await db.getAllAsync<{ tuKhoa: string }>(
    'SELECT tuKhoa FROM lich_su_tim_kiem ORDER BY id DESC LIMIT ?',
    [gioiHan],
  );
  return dong.map((d) => d.tuKhoa);
}

export const boNhoCongThuc = {
  luu: (congThuc: CongThuc) => luuCongThucVaoCache(layDatabase(), congThuc),
  layTheoId: (id: string) => layCongThucTuCache(layDatabase(), id),
  timKiem: (tuKhoa: string, gioiHan?: number) =>
    timCongThucTrongCache(layDatabase(), tuKhoa, gioiHan),
  xoa: (id: string) => xoaCongThucKhoiCache(layDatabase(), id),
  luuTuKhoa: (tuKhoa: string) => luuLichSuTimKiem(layDatabase(), tuKhoa),
  layTuKhoa: (gioiHan?: number) => layLichSuTimKiem(layDatabase(), gioiHan),
};
