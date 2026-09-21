import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useDanhSachCongThuc } from '../../src/hooks/useRecipes';
import { dinhDangNgay } from '../../src/lib/utils/dinh-dang';
import { CAC_BUOI_AN, nhomMonTheoNgay } from '../../src/lib/utils/lich-tuan';
import {
  useChiTietKeHoachAn,
  useDanhSachKeHoachAn,
  useTaoTuKeHoachAn,
  useTaoKeHoachAn,
  useThemMonVaoKeHoach,
  useXoaKeHoachAn,
} from '../../src/hooks/useMealShopping';

// BR-MEAL: Chọn món từ danh sách công thức vào đúng ngày + buổi + khẩu phần
function ChonMonChoNgay({
  keHoachId,
  ngayMacDinh,
  khiDong,
}: {
  keHoachId: string;
  ngayMacDinh: string;
  khiDong: () => void;
}) {
  const [tuKhoa, setTuKhoa] = useState('');
  const [congThucChon, setCongThucChon] = useState('');
  const [ngay, setNgay] = useState(ngayMacDinh);
  const [buoi, setBuoi] = useState<string>('LUNCH');
  const [khauPhan, setKhauPhan] = useState('2');
  const tuKhoaTre = useDebounce(tuKhoa.trim(), 400);
  const goiY = useDanhSachCongThuc({ page: 0, size: 5, ...(tuKhoaTre ? { search: tuKhoaTre } : {}) });
  const themMon = useThemMonVaoKeHoach(keHoachId);

  return (
    <BottomSheet hienThi tieuDe="Chọn món cho ngày" khiDong={khiDong}>
      <ONhapLieu nhan="Tìm món" giaTri={tuKhoa} khiDoi={setTuKhoa} goiY="VD: phở bò" className="mt-3" />
      <View className="mt-2">
        {(goiY.data?.noiDung ?? []).map((ct) => (
          <Pressable
            key={ct.id}
            accessibilityRole="button"
            onPress={() => setCongThucChon(ct.id)}
            className={`rounded-xl border px-3 py-2 ${congThucChon === ct.id ? 'border-primary bg-accent-light' : 'border-neutral-200'}`}
          >
            <BodyText soDongToiDa={1}>{ct.ten}</BodyText>
          </Pressable>
        ))}
      </View>
      <ONhapLieu nhan="Ngày (YYYY-MM-DD)" giaTri={ngay} khiDoi={setNgay} goiY={ngayMacDinh} className="mt-3" />
      <View className="mt-3 flex-row gap-2">
        {CAC_BUOI_AN.map((b) => (
          <Chip key={b.ma} nhan={b.nhan} chon={buoi === b.ma} khiBam={() => setBuoi(b.ma)} />
        ))}
      </View>
      <ONhapLieu nhan="Khẩu phần (người)" giaTri={khauPhan} khiDoi={setKhauPhan} banPhim="numeric" className="mt-3" />
      <NutBam
        tieuDe="Thêm món"
        voHieuHoa={!congThucChon || !ngay.trim()}
        dangTai={themMon.isPending}
        khiBam={() =>
          themMon.mutate(
            { congThucId: congThucChon, ngay: ngay.trim(), buoiAn: buoi, khauPhan: parseInt(khauPhan, 10) || 1 },
            { onSuccess: () => khiDong() },
          )
        }
        className="mt-4"
      />
    </BottomSheet>
  );
}

function ChiTietKeHoach({ keHoachId, khiDong }: { keHoachId: string; khiDong: () => void }) {
  const { data, isLoading, isError } = useChiTietKeHoachAn(keHoachId);
  // BR-SHOP: Sinh đi chợ từ kế hoạch — server gộp nguyên liệu + scale khẩu phần
  const taoDiCho = useTaoTuKeHoachAn();
  const [dangChonMon, setDangChonMon] = useState(false);

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được kế hoạch" />;

  const lichTuan = nhomMonTheoNgay(data.cacMon, data.ngayBatDau, data.ngayKetThuc);

  return (
    <View className="mt-2 rounded-xl bg-neutral-100 p-3">
      {data.cacMon.length === 0 ? (
        <CaptionText>Chưa có món nào trong kế hoạch</CaptionText>
      ) : (
        lichTuan.map((ngay) => {
          const coMon = ngay.cacBuoi.some((b) => b.mon.length > 0);
          if (!coMon) return null;
          return (
            <View key={ngay.ngay} className="mb-2">
              <CaptionText dam>{dinhDangNgay(ngay.ngay)}</CaptionText>
              {ngay.cacBuoi.map((buoi) =>
                buoi.mon.length === 0 ? null : (
                  <View key={buoi.ma}>
                    {buoi.mon.map((mon) => (
                      <View
                        key={mon.id}
                        className="flex-row items-center justify-between border-b border-neutral-200 py-2"
                      >
                        <View className="flex-1">
                          <BodyText soDongToiDa={1}>{mon.congThuc?.ten ?? 'Món đã xóa'}</BodyText>
                          <CaptionText>Buổi {buoi.nhan}</CaptionText>
                        </View>
                        <NumberDisplay value={mon.khauPhan} unit="người" className="text-sm" />
                      </View>
                    ))}
                  </View>
                ),
              )}
            </View>
          );
        })
      )}
      <View className="mt-3 flex-row gap-2">
        <NutBam tieuDe="+ Món" bienThe="vien" khiBam={() => setDangChonMon(true)} className="flex-1" />
        <NutBam
          tieuDe="Tạo danh sách đi chợ"
          bienThe="vien"
          dangTai={taoDiCho.isPending}
          khiBam={() => taoDiCho.mutate(data.id, { onSuccess: () => khiDong() })}
          className="flex-1"
        />
        <NutBam tieuDe="Đóng" bienThe="mo" khiBam={khiDong} />
      </View>
      {dangChonMon ? (
        <ChonMonChoNgay
          keHoachId={data.id}
          ngayMacDinh={data.ngayBatDau}
          khiDong={() => setDangChonMon(false)}
        />
      ) : null}
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
    <SafeAreaView className="flex-1 bg-mist">
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
