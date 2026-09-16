import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { dinhDangNgay } from '../../src/lib/utils/dinh-dang';
import {
  useChiTietKeHoachAn,
  useDanhSachKeHoachAn,
  useTaoDanhSachDiCho,
  useTaoKeHoachAn,
  useXoaKeHoachAn,
} from '../../src/hooks/useMealShopping';

function ChiTietKeHoach({ keHoachId, khiDong }: { keHoachId: string; khiDong: () => void }) {
  const { data, isLoading, isError } = useChiTietKeHoachAn(keHoachId);
  const taoDiCho = useTaoDanhSachDiCho();

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được kế hoạch" />;

  return (
    <View className="mt-2 rounded-xl bg-neutral-100 p-3">
      {data.cacMon.length === 0 ? (
        <CaptionText>Chưa có món nào trong kế hoạch</CaptionText>
      ) : (
        data.cacMon.map((mon) => (
          <View key={mon.id} className="flex-row items-center justify-between border-b border-neutral-200 py-2">
            <View className="flex-1">
              <BodyText soDongToiDa={1}>{mon.congThuc?.ten ?? 'Món đã xóa'}</BodyText>
              <CaptionText>
                {dinhDangNgay(mon.ngay)} • {mon.loaiBuoiAn}
              </CaptionText>
            </View>
            <NumberDisplay value={mon.khauPhan} unit="người" className="text-sm" />
          </View>
        ))
      )}
      <View className="mt-3 flex-row gap-2">
        <NutBam
          tieuDe="Tạo danh sách đi chợ"
          bienThe="vien"
          dangTai={taoDiCho.isPending}
          khiBam={() =>
            taoDiCho.mutate({ ten: `Đi chợ - ${data.ten}`, loaiNguon: 'MEAL_PLAN', nguonId: data.id })
          }
          className="flex-1"
        />
        <NutBam tieuDe="Đóng" bienThe="mo" khiBam={khiDong} />
      </View>
    </View>
  );
}

export default function ManHinhKeHoachAn() {
  const { data, isLoading, isError, refetch } = useDanhSachKeHoachAn();
  const taoMoi = useTaoKeHoachAn();
  const xoa = useXoaKeHoachAn();
  const [moRongId, setMoRongId] = useState<string | null>(null);
  const [dangTao, setDangTao] = useState(false);
  const [ten, setTen] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  const luuMoi = () => {
    taoMoi.mutate(
      { ten: ten.trim(), ngayBatDau: tuNgay.trim(), ngayKetThuc: denNgay.trim() },
      {
        onSuccess: () => {
          setTen('');
          setTuNgay('');
          setDenNgay('');
          setDangTao(false);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between">
          <TitleText className="text-2xl">Kế hoạch ăn</TitleText>
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="mo" khiBam={() => setDangTao((v) => !v)} />
        </View>

        {dangTao ? (
          <View className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <ONhapLieu nhan="Tên kế hoạch" giaTri={ten} khiDoi={setTen} goiY="VD: Tuần 1" />
            <ONhapLieu nhan="Từ ngày (YYYY-MM-DD)" giaTri={tuNgay} khiDoi={setTuNgay} goiY="2026-09-01" className="mt-3" />
            <ONhapLieu nhan="Đến ngày (YYYY-MM-DD)" giaTri={denNgay} khiDoi={setDenNgay} goiY="2026-09-07" className="mt-3" />
            <NutBam tieuDe="Lưu kế hoạch" khiBam={luuMoi} dangTai={taoMoi.isPending} className="mt-4" />
          </View>
        ) : null}

        <View className="mt-4 pb-6">
          {isLoading ? (
            <TrangDangTai />
          ) : isError ? (
            <TrangLoi loi="Không tải được danh sách" khiThuLai={() => refetch()} />
          ) : (data?.noiDung.length ?? 0) === 0 ? (
            <TrangTrong tieuDe="Chưa có kế hoạch" moTa="Tạo kế hoạch tuần để nấu ăn đều đặn" />
          ) : (
            data?.noiDung.map((keHoach) => (
              <View key={keHoach.id} className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
                <Pressable
                  onPress={() => setMoRongId((id) => (id === keHoach.id ? null : keHoach.id))}
                >
                  <BodyText dam>{keHoach.ten}</BodyText>
                  <CaptionText>
                    {dinhDangNgay(keHoach.ngayBatDau)} - {dinhDangNgay(keHoach.ngayKetThuc)}
                  </CaptionText>
                </Pressable>
                {moRongId === keHoach.id ? (
                  <ChiTietKeHoach keHoachId={keHoach.id} khiDong={() => setMoRongId(null)} />
                ) : null}
                <View className="mt-2 flex-row justify-end">
                  <NutBam
                    tieuDe="Xóa"
                    bienThe="mo"
                    khiBam={() => xoa.mutate(keHoach.id)}
                    className="px-0 py-1"
                  />
                </View>
              </View>
            ))
          )}
          <Text className="h-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
