import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { useAuthStore } from '../../src/stores/authStore';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { ChonBuoiAn, ChonKhoangNgay, DaiNgay, TangGiamKhauPhan } from '../../src/components/meal/BoChonMon';
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
  // BR-MEAL: 1 danh sách duy nhất theo tab, khỏi 3 khối trùng nhau khó chọn
  const [nguon, setNguon] = useState<'da-luu' | 'cua-toi' | 'tim'>('da-luu');
  const [congThucChon, setCongThucChon] = useState('');
  const [ngay, setNgay] = useState(ngayMacDinh);
  const [buoi, setBuoi] = useState<string>(() => buoiGoiYTheoGio());
  const [khauPhan, setKhauPhan] = useState(2);
  const [loiThem, setLoiThem] = useState('');
  const tuKhoaTre = useDebounce(tuKhoa.trim(), 400);
  const goiY = useDanhSachCongThuc({ page: 0, size: 5, ...(tuKhoaTre ? { search: tuKhoaTre } : {}) });
  const themMon = useThemMonVaoKeHoach(keHoachId);
  // BR-MEAL: Tận dụng 2 nguồn trang chủ — món đã lưu + món của tôi, nhấn là chọn
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const daLuu = useDanhSachYeuThich(0, 20);
  const cuaToi = useDanhSachCongThuc({
    page: 0,
    size: 20,
    ...(nguoiDung?.id ? { tacGiaId: nguoiDung.id } : {}),
  });
  const danhSachNguon =
    nguon === 'da-luu' ? (daLuu.data?.noiDung ?? []) : nguon === 'cua-toi' ? (cuaToi.data?.noiDung ?? []) : (goiY.data?.noiDung ?? []);

  const luuMon = () => {
    if (!congThucChon || !ngay.trim()) return;
    setLoiThem('');
    themMon.mutate(
      { congThucId: congThucChon, ngay: ngay.trim(), buoiAn: buoi, khauPhan },
      {
        onSuccess: () => khiDong(),
        // BR-MEAL: Hiện mã thật MEAL-00/06/07 để biết thiếu field, ngoài khoảng hay trùng buổi
        onError: (loi: unknown) => {
          const thongDiep = loi instanceof Error ? loi.message : '';
          setLoiThem(thongDiep || 'Không thêm được, thử lại sau');
        },
      },
    );
  };

  return (
    <BottomSheet hienThi tieuDe="Chọn món cho ngày" khiDong={khiDong}>
      <View className="mt-3 flex-row gap-2">
        <Chip nhan="Đã lưu" chon={nguon === 'da-luu'} khiBam={() => setNguon('da-luu')} />
        <Chip nhan="Của tôi" chon={nguon === 'cua-toi'} khiBam={() => setNguon('cua-toi')} />
        <Chip nhan="Tìm món" chon={nguon === 'tim'} khiBam={() => setNguon('tim')} />
      </View>
      {nguon === 'tim' ? (
        <ONhapLieu nhan="Tìm món" giaTri={tuKhoa} khiDoi={setTuKhoa} goiY="VD: phở bò" className="mt-3" />
      ) : null}
      <View className="mt-2 gap-1.5">
        {danhSachNguon.length === 0 ? (
          <CaptionText canLe="giua">
            {nguon === 'da-luu' ? 'Chưa lưu món nào — qua trang chủ lưu món yêu thích' : nguon === 'cua-toi' ? 'Chưa có món nào — tạo món đầu tiên của bạn' : 'Không tìm thấy món'}
          </CaptionText>
        ) : (
          danhSachNguon.map((ct) => (
            <Pressable
              key={ct.id}
              accessibilityRole="button"
              onPress={() => setCongThucChon(ct.id)}
              className={`flex-row items-center gap-2 rounded-xl border px-3 py-2 ${congThucChon === ct.id ? 'border-primary bg-accent-light' : 'border-neutral-200'}`}
            >
              {ct.anhThumbnail ? (
                <Image
                  source={{ uri: layUrlAnh(ct.anhThumbnail) }}
                  style={{ width: 40, height: 40, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-cream">
                  <Text className="text-sm font-bold text-accent-dark">
                    {ct.ten.trim().charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="min-w-0 flex-1">
                <BodyText soDongToiDa={1}>{ct.ten}</BodyText>
                <CaptionText soDongToiDa={1}>{ct.tacGia.tenHienThi}</CaptionText>
              </View>
            </Pressable>
          ))
        )}
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
      {!congThucChon ? <CaptionText canLe="giua" className="mt-1">Hãy chọn 1 món ở trên rồi bấm Thêm món</CaptionText> : null}
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
  // BR-SHOP: Tick chọn từng ngày T2..CN, null nghĩa là chọn hết (cả tuần)
  const [ngayDiCho, setNgayDiCho] = useState<string[] | null>(null);
  // BR-SHOP: Khẩu phần đổi thì list đi chợ cũ không còn đúng — nhắc sinh lại
  const [daDoiKhauPhan, setDaDoiKhauPhan] = useState(false);

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được kế hoạch" />;

  const lichTuan = nhomMonTheoNgay(data.cacMon, data.ngayBatDau, data.ngayKetThuc);
  const tongKhauPhan = data.cacMon.reduce((s, m) => s + m.khauPhan, 0);
  // BR-SHOP: Ngày tick đi chợ — null là chọn hết cả tuần
  const tatCaNgay = lichTuan.map((n) => n.ngay);
  const cacNgayDiCho = ngayDiCho ?? tatCaNgay;
  const doiTickNgay = (ngay: string) => {
    const hien = ngayDiCho ?? tatCaNgay;
    setNgayDiCho(hien.includes(ngay) ? hien.filter((n) => n !== ngay) : [...hien, ngay]);
  };

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

      <CaptionText className="mt-3 font-semibold">Tick ngày đi chợ ({cacNgayDiCho.length}/{tatCaNgay.length})</CaptionText>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {lichTuan.map((n) => {
          const chon = cacNgayDiCho.includes(n.ngay);
          return (
            <Pressable
              key={n.ngay}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: chon }}
              onPress={() => doiTickNgay(n.ngay)}
              className={`w-14 items-center rounded-2xl border px-1 py-2 ${chon ? 'border-primary bg-primary' : 'border-neutral-200 bg-white'}`}
            >
              <Text className={`text-[11px] font-semibold ${chon ? 'text-white' : 'text-neutral-500'}`}>
                {tenThuTiengViet(n.ngay)}
              </Text>
              <Text className={`mt-0.5 text-sm font-bold ${chon ? 'text-white' : 'text-primary'}`}>
                {dinhDangNgay(n.ngay).slice(0, 5)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <NutBam
        tieuDe={`Đẩy ${cacNgayDiCho.length} ngày sang đi chợ`}
        voHieuHoa={cacNgayDiCho.length === 0}
        dangTai={taoDiCho.isPending}
        khiBam={() => {
          // BR-SHOP: Chọn hết thì gửi cả tuần (không kèm ngày), tick lẻ thì gửi đúng các ngày
          const payload =
            cacNgayDiCho.length === tatCaNgay.length
              ? { mealPlanId: data.id }
              : { mealPlanId: data.id, cacNgay: [...cacNgayDiCho].sort() };
          taoDiCho.mutate(payload, {
            onSuccess: () => {
              setDaDoiKhauPhan(false);
              khiDong();
            },
          });
        }}
        className="mt-2"
      />
      {taoDiCho.isError ? <CaptionText className="mt-1 text-red-500">Không tạo được danh sách đi chợ</CaptionText> : null}
      {daDoiKhauPhan ? (
        <CaptionText className="mt-1 text-amber-600">
          Khẩu phần đã đổi — bấm đẩy sang đi chợ để sinh lại đúng số mới.
        </CaptionText>
      ) : null}

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
                                onPress={() => suaMon.mutate(
                                  { monId: mon.id, payload: { khauPhan: Math.max(1, mon.khauPhan - 1) } },
                                  { onSuccess: () => setDaDoiKhauPhan(true) },
                                )}
                                className="h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white"
                              >
                                <Text className="text-sm font-bold text-primary">−</Text>
                              </Pressable>
                              <NumberDisplay value={mon.khauPhan} unit="ng" className="text-xs" />
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Tăng khẩu phần"
                                onPress={() => suaMon.mutate(
                                  { monId: mon.id, payload: { khauPhan: Math.min(20, mon.khauPhan + 1) } },
                                  { onSuccess: () => setDaDoiKhauPhan(true) },
                                )}
                                className="h-7 w-7 items-center justify-center rounded-full bg-primary"
                              >
                                <Text className="text-sm font-bold text-white">+</Text>
                              </Pressable>
                            </View>
                            <Pressable
                              accessibilityRole="button"
                              disabled={xoaMon.isPending}
                              onPress={() => xoaMon.mutate(mon.id)}
                              className={xoaMon.isPending ? 'opacity-50' : undefined}
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
        </CaptionText>
        <View className="mt-1 flex-row items-center justify-between">
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
            <View className="mt-3">
              <ChonKhoangNgay
                tuNgay={tuNgay}
                denNgay={denNgay}
                khiDoi={(t, d) => { setTuNgay(t); setDenNgay(d); if (loiTao) setLoiTao(''); }}
              />
            </View>
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
                  <View className="mt-3">
                    <ChonKhoangNgay
                      tuNgay={suaTuNgay}
                      denNgay={suaDenNgay}
                      khiDoi={(t, d) => { setSuaTuNgay(t); setSuaDenNgay(d); if (loiSua) setLoiSua(''); }}
                    />
                  </View>
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
