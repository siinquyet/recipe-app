import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aggregateQuantities } from '@cook/shared';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { parseVn } from '../../src/lib/utils/dinh-dang';import {
  useChiTietDanhSachDiCho,
  useChuyenTrangThaiMon,
  useDanhSachDiCho,
  useTaoDanhSachDiCho,
} from '../../src/hooks/useMealShopping';

// BR-SHOP: Trạng thái đã mua lưu server (optimistic), gộp định lượng theo BR-03
function ChiTietDiCho({ id, khiDong }: { id: string; khiDong: () => void }) {
  const { data, isLoading, isError } = useChiTietDanhSachDiCho(id);
  const chuyenTrangThai = useChuyenTrangThaiMon(id);

  const tongHop = useMemo(() => {
    if (!data) return [];
    return [...aggregateQuantities(
      data.cacMon.map((mon) => ({
        ...(mon.nguyenLieuId ? { internalIngredientId: mon.nguyenLieuId } : {}),
        originalText: mon.tenGoc,
        quantity: parseVn(mon.dinhLuong) || 0,
        unit: mon.donVi,
      })),
    ).values()];
  }, [data]);

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được chi tiết" />;

  return (
    <View className="mt-2 rounded-xl bg-neutral-100 p-3">
      {tongHop.length > 1 ? (
        <View className="mb-2 rounded-xl bg-white p-3">
          <CaptionText dam>Tổng hợp ({tongHop.length} nhóm)</CaptionText>
          {tongHop.map((nhom, i) => (
            <View key={i} className="flex-row items-center justify-between py-1">
              <BodyText soDongToiDa={1} className="flex-1">
                {nhom.originalTexts[0]}
                {nhom.originalTexts.length > 1 ? ` (+${nhom.originalTexts.length - 1})` : ''}
              </BodyText>
              <NumberDisplay value={nhom.quantity} unit={nhom.unit} className="text-sm" />
            </View>
          ))}
        </View>
      ) : null}
      {data.cacMon.map((mon) => (
        <Pressable
          key={mon.id}
          onPress={() => chuyenTrangThai.mutate({ itemId: mon.id, daChon: !mon.daChon })}
          className="flex-row items-center justify-between border-b border-neutral-200 py-2"
        >
          <View className="flex-1">
            <BodyText soDongToiDa={1} className={mon.daChon ? 'text-neutral-400 line-through' : ''}>
              {mon.tenGoc}
            </BodyText>
          </View>
          <NumberDisplay value={mon.dinhLuong} unit={mon.donVi} className="text-sm" />
        </Pressable>
      ))}
      <NutBam tieuDe="Đóng" bienThe="mo" khiBam={khiDong} className="mt-2" />
    </View>
  );
}

export default function ManHinhDiCho() {
  const { data, isLoading, isError, refetch } = useDanhSachDiCho();
  const taoMoi = useTaoDanhSachDiCho();
  const [moRongId, setMoRongId] = useState<string | null>(null);
  const [dangTao, setDangTao] = useState(false);
  const [ten, setTen] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <TitleText className="text-2xl">Danh sách đi chợ</TitleText>
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="mo" khiBam={() => setDangTao((v) => !v)} />
        </View>

        {dangTao ? (
          <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <ONhapLieu nhan="Tên danh sách" giaTri={ten} khiDoi={setTen} goiY="VD: Đi chợ cuối tuần" />
            <NutBam
              tieuDe="Tạo danh sách"
              dangTai={taoMoi.isPending}
              khiBam={() =>
                taoMoi.mutate(
                  { ten: ten.trim(), loaiNguon: 'MANUAL' },
                  { onSuccess: () => { setTen(''); setDangTao(false); } },
                )
              }
              className="mt-4"
            />
          </View>
        ) : null}

        <View className="mt-4 pb-6">
          {isLoading ? (
            <TrangDangTai />
          ) : isError ? (
            <TrangLoi loi="Không tải được danh sách" khiThuLai={() => refetch()} />
          ) : (data?.noiDung.length ?? 0) === 0 ? (
            <TrangTrong tieuDe="Chưa có danh sách" moTa="Tạo từ kế hoạch ăn hoặc tạo thủ công" />
          ) : (
            data?.noiDung.map((ds) => (
              <View key={ds.id} className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
                <Pressable onPress={() => setMoRongId((id) => (id === ds.id ? null : ds.id))}>
                  <BodyText dam>{ds.ten}</BodyText>
                  <CaptionText>
                    {ds.cacMon.length} món • {ds.trangThai}
                  </CaptionText>
                </Pressable>
                {moRongId === ds.id ? <ChiTietDiCho id={ds.id} khiDong={() => setMoRongId(null)} /> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
