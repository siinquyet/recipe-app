import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { ChonBuoiAn, DaiNgay, TangGiamKhauPhan } from '../../src/components/meal/BoChonMon';
import { useDebounce } from '../../src/hooks/useDebounce';
import { useDanhSachCongThuc, useDanhSachYeuThich } from '../../src/hooks/useRecipes';
import { dinhDangNgay } from '../../src/lib/utils/dinh-dang';
import { buoiGoiYTheoGio, nhomMonTheoNgay, tenThuTiengViet } from '../../src/lib/utils/lich-tuan';
import {
  useCapNhatKeHoachAn,
  useCapNhatMonTrongKeHoach,
  useChiTietKeHoachAn,
  useDanhSachKeHoachAn,
  useTaoTuKeHoachAn,
  useTaoKeHoachAn,
  useThemMonVaoKeHoach,
  useXoaKeHoachAn,
  useXoaMonKhoiKeHoach,
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
  const [buoi, setBuoi] = useState<string>(() => buoiGoiYTheoGio());
  const [khauPhan, setKhauPhan] = useState(2);
  const [loiThem, setLoiThem] = useState('');
  const tuKhoaTre = useDebounce(tuKhoa.trim(), 400);
  const goiY = useDanhSachCongThuc({ page: 0, size: 5, ...(tuKhoaTre ? { search: tuKhoaTre } : {}) });
  const themMon = useThemMonVaoKeHoach(keHoachId);
  // BR-MEAL: Chọn nhanh từ món đã lưu + món của tôi, khỏi gõ tìm kiếm
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const daLuu = useDanhSachYeuThich(0, 5);
  const cuaToi = useDanhSachCongThuc({
    page: 0,
    size: 5,
    ...(nguoiDung?.id ? { tacGiaId: nguoiDung.id } : {}),
  });

  const HangChonNhanh = ({ tieuDe, ds }: { tieuDe: string; ds: Array<{ id: string; ten: string }> }) => {
    if (ds.length === 0) return null;
    return (
      <View className="mt-3">
        <CaptionText className="font-semibold">{tieuDe}</CaptionText>
        <View className="mt-2 gap-1.5">
          {ds.map((ct) => (
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
      </View>
    );
  };

  const luuMon = () => {
    if (!congThucChon || !ngay.trim()) return;
    setLoiThem('');
    themMon.mutate(
      { congThucId: congThucChon, ngay: ngay.trim(), buoiAn: buoi, khauPhan },
      { onSuccess: () => khiDong() },
    );
  };

  return (
    <BottomSheet hienThi tieuDe="Chọn món cho ngày" khiDong={khiDong}>
      <HangChonNhanh tieuDe="Món đã lưu" ds={daLuu.data?.noiDung ?? []} />
      <HangChonNhanh tieuDe="Món của tôi" ds={cuaToi.data?.noiDung ?? []} />
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
      <View className="mt-3">
        <DaiNgay ngayChon={ngay} khiChon={setNgay} tuNgay={ngayMacDinh} />
      </View>
      <View className="mt-3">
        <ChonBuoiAn buoiChon={buoi} khiChon={setBuoi} />
      </View>
      <View className="mt-3">
        <TangGiamKhauPhan khauPhan={khauPhan} khiDoi={setKhauPhan} />
      </View>
      {loiThem ? <CaptionText className="mt-1 text-red-500">{loiThem}</CaptionText> : null}
      {themMon.isError ? <CaptionText className="mt-1 text-red-500">Không thêm được, thử lại sau</CaptionText> : null}
      <NutBam
        tieuDe="Thêm món"
        voHieuHoa={!congThucChon || !ngay.trim()}
        dangTai={themMon.isPending}
        khiBam={luuMon}
        className="mt-4"
      />
    </BottomSheet>
  );
}

// BR-MEAL: Lịch tuần y web KeHoach — thẻ số + từng ngày + món theo buổi
function ChiTietKeHoach({ keHoachId, khiDong }: { keHoachId: string; khiDong: () => void }) {
  const { data, isLoading, isError } = useChiTietKeHoachAn(keHoachId);
  // BR-SHOP: Sinh đi chợ từ kế hoạch — server gộp nguyên liệu + scale khẩu phần
  const taoDiCho = useTaoTuKeHoachAn();
  const xoaMon = useXoaMonKhoiKeHoach(keHoachId);
  const suaMon = useCapNhatMonTrongKeHoach(keHoachId);
  const [monMoiNgay, setMonMoiNgay] = useState<string | null>(null);

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được kế hoạch" />;

  const lichTuan = nhomMonTheoNgay(data.cacMon, data.ngayBatDau, data.ngayKetThuc);
  const tongKhauPhan = data.cacMon.reduce((s, m) => s + m.khauPhan, 0);

  return (
    <View>
      <View className="mt-4 flex-row flex-wrap gap-2">
        {[
          { nhan: 'Tổng món ăn', giaTri: <NumberDisplay value={data.cacMon.length} unit="món" /> },
          { nhan: 'Số ngày', giaTri: <NumberDisplay value={lichTuan.length} unit="ngày" /> },
          { nhan: 'Tổng khẩu phần', giaTri: <NumberDisplay value={tongKhauPhan} unit="phần" /> },
          { nhan: 'Từ ngày', giaTri: <Text className="font-serif text-xl font-black text-primary">{dinhDangNgay(data.ngayBatDau).slice(0, 5)}</Text> },
        ].map((s) => (
          <View key={s.nhan} className="min-w-[22%] flex-1 items-center rounded-3xl bg-white p-3 shadow-sm">
            <CaptionText canLe="giua" className="font-bold uppercase">{s.nhan}</CaptionText>
            <View className="mt-1">{s.giaTri}</View>
          </View>
        ))}
      </View>

      <NutBam
        tieuDe="Tạo danh sách đi chợ"
        bienThe="vien"
        dangTai={taoDiCho.isPending}
        khiBam={() => taoDiCho.mutate(data.id, { onSuccess: () => khiDong() })}
        className="mt-4"
      />
      {taoDiCho.isError ? <CaptionText className="mt-1 text-red-500">Không tạo được danh sách đi chợ</CaptionText> : null}

      <TitleText className="mt-6 text-xl">Lịch trình bữa ăn trong tuần</TitleText>
      {lichTuan.map((ngay) => {
        const coMon = ngay.cacBuoi.some((b) => b.mon.length > 0);
        return (
          <View key={ngay.ngay} className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
            <CaptionText className="text-center">{dinhDangNgay(ngay.ngay)}</CaptionText>
            <Text className="text-center font-serif text-lg font-black text-primary">
              {tenThuTiengViet(ngay.ngay)}
            </Text>
            <View className="mt-2 gap-2">
              {coMon ? (
                ngay.cacBuoi.map((buoi) =>
                  buoi.mon.length === 0 ? null : (
                    <View key={buoi.ma} className="gap-2">
                      {buoi.mon.map((mon) => (
                        <View key={mon.id} className="rounded-xl bg-mist p-2">
                          <Text className="text-[10px] font-bold uppercase tracking-widest text-deepteal">
                            {buoi.nhan}
                          </Text>
                          <BodyText soDongToiDa={1} className="mt-0.5 text-xs font-semibold">
                            {mon.congThuc?.ten ?? 'Món đã xóa'}
                          </BodyText>
                          <View className="mt-1 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Giảm khẩu phần"
                                onPress={() => suaMon.mutate({ monId: mon.id, payload: { khauPhan: Math.max(1, mon.khauPhan - 1) } })}
                                className="h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white"
                              >
                                <Text className="text-sm font-bold text-primary">−</Text>
                              </Pressable>
                              <NumberDisplay value={mon.khauPhan} unit="ng" className="text-xs" />
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Tăng khẩu phần"
                                onPress={() => suaMon.mutate({ monId: mon.id, payload: { khauPhan: Math.min(20, mon.khauPhan + 1) } })}
                                className="h-7 w-7 items-center justify-center rounded-full bg-primary"
                              >
                                <Text className="text-sm font-bold text-white">+</Text>
                              </Pressable>
                            </View>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() => xoaMon.mutate(mon.id)}
                            >
                              <Text className="text-xs font-medium text-red-500">Xóa món</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  ),
                )
              ) : (
                <CaptionText canLe="giua">Trống</CaptionText>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => setMonMoiNgay(ngay.ngay)}
                className="flex-row items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 py-2"
              >
                <Plus size={14} color="#97A2B0" />
                <Text className="text-xs font-semibold text-neutral-500">Thêm món</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {xoaMon.isError ? <CaptionText className="mt-1 text-red-500">Không xóa món được, thử lại sau</CaptionText> : null}
      {monMoiNgay ? (
        <ChonMonChoNgay
          keHoachId={data.id}
          ngayMacDinh={monMoiNgay}
          khiDong={() => setMonMoiNgay(null)}
        />
      ) : null}
    </View>
  );
}

export default function ManHinhKeHoachAn() {
  const router = useRouter();
  // BR-MEAL: Kế hoạch là dữ liệu riêng từng tài khoản — chưa đăng nhập thì mời đăng nhập
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const { data, isLoading, isError, refetch } = useDanhSachKeHoachAn();
  const taoMoi = useTaoKeHoachAn();
  const xoa = useXoaKeHoachAn();
  const [keHoachChon, setKeHoachChon] = useState<string | null>(null);
  const [dangTao, setDangTao] = useState(false);
  const [ten, setTen] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [loiTao, setLoiTao] = useState('');
  // BR-MEAL: Sửa tên + khoảng ngày kế hoạch có sẵn
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [suaTen, setSuaTen] = useState('');
  const [suaTuNgay, setSuaTuNgay] = useState('');
  const [suaDenNgay, setSuaDenNgay] = useState('');
  const [loiSua, setLoiSua] = useState('');
  const capNhat = useCapNhatKeHoachAn(dangSuaId ?? '');

  const keHoachId = keHoachChon ?? data?.noiDung[0]?.id ?? null;

  // BR-MEAL: Validate khoảng ngày phía client (định dạng + bắt đầu ≤ kết thúc)
  const kiemTraKhoangNgay = (tenKeHoach: string, batDau: string, ketThuc: string): string => {
    if (!tenKeHoach.trim()) return 'Vui lòng nhập tên kế hoạch';
    if (!batDau.trim() || !ketThuc.trim()) return 'Vui lòng nhập đủ từ ngày và đến ngày (YYYY-MM-DD)';
    const tu = new Date(`${batDau.trim()}T00:00:00`);
    const den = new Date(`${ketThuc.trim()}T00:00:00`);
    if (Number.isNaN(tu.getTime()) || Number.isNaN(den.getTime())) return 'Ngày không hợp lệ (YYYY-MM-DD)';
    if (tu > den) return 'Ngày bắt đầu phải trước ngày kết thúc';
    return '';
  };

  const luuMoi = () => {
    const loi = kiemTraKhoangNgay(ten, tuNgay, denNgay);
    if (loi) {
      setLoiTao(loi);
      return;
    }
    setLoiTao('');
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

  const luuSua = () => {
    if (!dangSuaId) return;
    const loi = kiemTraKhoangNgay(suaTen, suaTuNgay, suaDenNgay);
    if (loi) {
      setLoiSua(loi);
      return;
    }
    setLoiSua('');
    capNhat.mutate(
      { ten: suaTen.trim(), ngayBatDau: suaTuNgay.trim(), ngayKetThuc: suaDenNgay.trim() },
      { onSuccess: () => setDangSuaId(null) },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-mist">
      {!nguoiDung ? (
        <View className="flex-1 items-center justify-center px-6">
          <TitleText canLe="giua" className="text-2xl">Kế hoạch của bạn</TitleText>
          <CaptionText canLe="giua" className="mt-2">Đăng nhập để xem kế hoạch ăn của riêng bạn</CaptionText>
          <NutBam tieuDe="Đăng nhập" khiBam={() => router.push('/(auth)/login')} className="mt-4 px-8" />
        </View>
      ) : (
      <ScrollView className="flex-1 px-4 pt-4">
        <CaptionText className="font-bold uppercase tracking-widest text-deepteal">
          Kế hoạch tuần & Đi chợ tự động
        </CaptionText>        <View className="mt-1 flex-row items-center justify-between">
          <TitleText className="flex-1 text-2xl">Kế hoạch dinh dưỡng tuần này</TitleText>
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="mo" khiBam={() => { setDangTao((v) => !v); setLoiTao(''); }} />
        </View>

        {(data?.noiDung.length ?? 0) > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {(data?.noiDung ?? []).map((kh) => (
                <Chip
                  key={kh.id}
                  nhan={kh.ten}
                  chon={keHoachId === kh.id}
                  khiBam={() => setKeHoachChon(kh.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        {dangTao ? (
          <View className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
            <ONhapLieu nhan="Tên kế hoạch" giaTri={ten} khiDoi={(giaTri) => { setTen(giaTri); if (loiTao) setLoiTao(''); }} goiY="VD: Tuần 1" />
            <ONhapLieu nhan="Từ ngày (YYYY-MM-DD)" giaTri={tuNgay} khiDoi={(giaTri) => { setTuNgay(giaTri); if (loiTao) setLoiTao(''); }} goiY="2026-09-01" className="mt-3" />
            <ONhapLieu nhan="Đến ngày (YYYY-MM-DD)" giaTri={denNgay} khiDoi={(giaTri) => { setDenNgay(giaTri); if (loiTao) setLoiTao(''); }} goiY="2026-09-07" className="mt-3" />
            {loiTao ? <CaptionText className="mt-1 text-red-500">{loiTao}</CaptionText> : null}
            {taoMoi.isError ? <CaptionText className="mt-1 text-red-500">Không lưu được, thử lại sau</CaptionText> : null}
            <NutBam tieuDe="Lưu kế hoạch" khiBam={luuMoi} dangTai={taoMoi.isPending} className="mt-4" />
          </View>
        ) : null}

        <View className="mt-4 pb-6">
          {isLoading ? (
            <TrangDangTai />
          ) : isError ? (
            <TrangLoi loi="Không tải được danh sách" khiThuLai={() => refetch()} />
          ) : !keHoachId ? (
            <TrangTrong tieuDe="Chưa có kế hoạch" moTa="Tạo kế hoạch tuần để nấu ăn đều đặn" />
          ) : (
            <View>
              <ChiTietKeHoach keHoachId={keHoachId} khiDong={() => {}} />
              {dangSuaId === keHoachId ? (
                <View className="mt-2 rounded-3xl bg-white p-4 shadow-sm">
                  <ONhapLieu nhan="Tên kế hoạch" giaTri={suaTen} khiDoi={(giaTri) => { setSuaTen(giaTri); if (loiSua) setLoiSua(''); }} />
                  <ONhapLieu nhan="Từ ngày (YYYY-MM-DD)" giaTri={suaTuNgay} khiDoi={(giaTri) => { setSuaTuNgay(giaTri); if (loiSua) setLoiSua(''); }} className="mt-3" />
                  <ONhapLieu nhan="Đến ngày (YYYY-MM-DD)" giaTri={suaDenNgay} khiDoi={(giaTri) => { setSuaDenNgay(giaTri); if (loiSua) setLoiSua(''); }} className="mt-3" />
                  {loiSua ? <CaptionText className="mt-1 text-red-500">{loiSua}</CaptionText> : null}
                  <View className="mt-3 flex-row gap-2">
                    <NutBam tieuDe="Lưu" dangTai={capNhat.isPending} khiBam={luuSua} className="flex-1" />
                    <NutBam tieuDe="Hủy" bienThe="mo" khiBam={() => { setDangSuaId(null); setLoiSua(''); }} className="flex-1" />
                  </View>
                </View>
              ) : null}
              <View className="mt-3 flex-row justify-end gap-2">
                <NutBam
                  tieuDe="Sửa"
                  bienThe="vien"
                  khiBam={() => {
                    const kh = data?.noiDung.find((k) => k.id === keHoachId);
                    if (!kh) return;
                    setDangSuaId(kh.id);
                    setSuaTen(kh.ten);
                    setSuaTuNgay(kh.ngayBatDau);
                    setSuaDenNgay(kh.ngayKetThuc);
                    setLoiSua('');
                  }}
                  className="px-4 py-2"
                />
                <NutBam
                  tieuDe="Xóa"
                  bienThe="mo"
                  dangTai={xoa.isPending}
                  khiBam={() => xoa.mutate(keHoachId, { onSuccess: () => setKeHoachChon(null) })}
                  className="px-4 py-2"
                />
              </View>
            </View>
          )}
          <Text className="h-4" />
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
