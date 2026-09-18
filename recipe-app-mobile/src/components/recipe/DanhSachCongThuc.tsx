import type { FC } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import type { CongThuc } from '../../types/api';
import { layUrlAnh } from '../../lib/utils/anh';
import { TheCongThuc, type BienTheCard } from './TheCongThuc';
import { TrangDangTai, TrangLoi, TrangTrong } from '../ui/TrangThai';

interface DanhSachCongThucProps {
  duLieu: CongThuc[];
  dangTai: boolean;
  dangTaiThem?: boolean;
  loi?: string | null;
  coTheTaiThem?: boolean;
  khiTaiThem?: () => void;
  khiLamMoi?: () => void;
  khiChon?: (id: string) => void;
  bienThe?: BienTheCard;
  cot?: number;
}

export function chuyenThanhDuLieuThe(congThuc: CongThuc) {
  return {
    id: congThuc.id,
    hinhAnh: layUrlAnh(congThuc.anhThumbnail),
    tenMon: congThuc.ten,
    thoiGianNau: congThuc.thoiGianNauPhut,
    khauPhan: congThuc.khauPhan,
    tacGia: congThuc.tacGia.tenHienThi,
    tacGiaAvatar: congThuc.tacGia.anhDaiDien,
  };
}

export const DanhSachCongThuc: FC<DanhSachCongThucProps> = ({
  duLieu,
  dangTai,
  dangTaiThem = false,
  loi,
  coTheTaiThem = false,
  khiTaiThem,
  khiLamMoi,
  khiChon,
  bienThe = 'large',
  cot = 1,
}) => {
  if (dangTai && duLieu.length === 0) return <TrangDangTai />;
  if (loi && duLieu.length === 0) return <TrangLoi loi={loi} khiThuLai={khiLamMoi} />;

  return (
    <FlatList
      data={duLieu}
      keyExtractor={(item) => item.id}
      numColumns={cot}
      key={cot}
      renderItem={({ item }) => (
        <View className={cot > 1 ? 'flex-1 p-1' : undefined}>
          <TheCongThuc
            duLieu={chuyenThanhDuLieuThe(item)}
            bienThe={bienThe}
            khiBam={khiChon ? () => khiChon(item.id) : undefined}
          />
        </View>
      )}
      onEndReached={() => {
        if (coTheTaiThem && !dangTaiThem) khiTaiThem?.();
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={dangTaiThem ? <TrangDangTai thongDiep="Đang tải thêm..." /> : null}
      ListEmptyComponent={
        <TrangTrong tieuDe="Chưa có công thức" moTa="Hãy thử từ khóa khác hoặc tạo món mới" />
      }
      refreshControl={
        khiLamMoi ? <RefreshControl refreshing={dangTai} onRefresh={khiLamMoi} /> : undefined
      }
    />
  );
};
