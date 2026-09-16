import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import {
  useChiTietDanhSachDiCho,
  useDanhSachDiCho,
  useTaoDanhSachDiCho,
} from '../../src/hooks/useMealShopping';

function ChiTietDiCho({ id, khiDong }: { id: string; khiDong: () => void }) {
  const { data, isLoading, isError } = useChiTietDanhSachDiCho(id);
  const [daChon, setDaChon] = useState<Set<string>>(new Set());

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được chi tiết" />;

  const chuyenChon = (monId: string) => {
    setDaChon((truoc) => {
      const moi = new Set(truoc);
      if (moi.has(monId)) moi.delete(monId);
      else moi.add(monId);
      return moi;
    });
  };

  return (
    <View className="mt-2 rounded-xl bg-neutral-100 p-3">
      {data.cacMon.map((mon) => {
        const chon = daChon.has(mon.id);
        return (
          <Pressable
            key={mon.id}
            onPress={() => chuyenChon(mon.id)}
            className="flex-row items-center justify-between border-b border-neutral-200 py-2"
          >
            <View className="flex-1">
              <BodyText soDongToiDa={1} className={chon ? 'text-neutral-400 line-through' : ''}>
                {mon.tenGoc}
              </BodyText>
            </View>
            <NumberDisplay value={mon.dinhLuong} unit={mon.donVi} className="text-sm" />
          </Pressable>
        );
      })}
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
