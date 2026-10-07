import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, Clock, Flame, Heart, Hourglass, Minus, Plus, Share2, Users } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../src/components/ui/Avatar';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { NutBam } from '../../src/components/ui/NutBam';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { RatingStars } from '../../src/components/ui/RatingStars';
import { TabBar } from '../../src/components/ui/TabBar';
import { TrangDangTai, TrangLoi } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { DanhSachCongThuc } from '../../src/components/recipe/DanhSachCongThuc';
import { ChonBuoiAn, DaiNgay, TangGiamKhauPhan } from '../../src/components/meal/BoChonMon';
import { buoiGoiYTheoGio, congNgay, homNay } from '../../src/lib/utils/lich-tuan';
import { kiemTraComboDoc } from '@cook/shared';
import { dinhDangNgay, formatVn, parseVn } from '../../src/lib/utils/dinh-dang';
import { MAU_SAC } from '../../src/constants/cau-hinh';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { danhGiaCongThuc } from '../../src/lib/api/recipes';
import { themMonVaoKeHoach } from '../../src/lib/api/mealPlans';
import { khoaTruyVan } from '../../src/lib/queryClient';
import { useAuthStore } from '../../src/stores/authStore';
import type { BinhLuan } from '../../src/types/api';
import {
  useBanCaNhan,
  useBinhLuan,
  useChiTietCongThuc,
  useChuyenDoiYeuThich,
  useCongThucTuongTu,
  useDanhSachYeuThich,
  useForkCongThuc,
  usePhanHoi,
  useSuaBinhLuan,
  useTaoBinhLuan,
  useTomTatDanhGia,
  useTraLoiBinhLuan,
  useXoaBinhLuan,
  useXoaCongThuc,
} from '../../src/hooks/useRecipes';
import { useDanhSachKeHoachAn, useTaoTuCongThuc } from '../../src/hooks/useMealShopping';

// SVG gốc: 2 tab Ingredients / Instructions (không có tab Nutrition riêng)
const CAC_TAB = ['Nguyên liệu', 'Hướng dẫn'] as const;

// BR-UI: Thẻ thông tin đồng bộ web chi tiết — 4 ô Chuẩn bị / Nấu chín / Khẩu phần / Năng lượng
const TheThongTin: FC<{ nhan: string; giaTri: string; Icon: LucideIcon }> = ({ nhan, giaTri, Icon }) => (
  <View className="flex-1 items-center rounded-2xl bg-mist px-1 py-3">
    <Icon size={18} color={MAU_SAC.TEAL} />
    <Text className="mt-1.5 text-center text-[15px] font-bold text-primary" numberOfLines={1}>
      {giaTri}
    </Text>
    <CaptionText>{nhan}</CaptionText>
  </View>
);

// BR-04: Scaled Quantity = Original Quantity × (Khẩu phần chọn / Khẩu phần gốc)
const HangNguyenLieu: FC<{
  ten: string;
  dinhLuong: string | number;
  donVi: string;
  tiLe: number;
}> = ({ ten, dinhLuong, donVi, tiLe }) => {
  const goc = parseVn(String(dinhLuong)) || 0;
  const daQuyDoi = goc > 0 ? formatVn(Math.round(goc * tiLe * 10) / 10) : String(dinhLuong);
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-cream">
        <Text className="text-lg font-bold text-accent">{ten.trim().charAt(0).toUpperCase()}</Text>
      </View>
      <BodyText className="flex-1 px-3" soDongToiDa={2}>
        {ten}
      </BodyText>
      <Text className="text-right text-sm font-semibold tabular-nums text-primary">
        {daQuyDoi} {donVi}
      </Text>
    </View>
  );
};

// BR-SOC: Khối đánh giá thật — điểm TB + phân bổ sao + chấm/cập nhật điểm
const KhoiDanhGia: FC<{ maCongThuc: string }> = ({ maCongThuc }) => {
  const queryClient = useQueryClient();
  const tomTat = useTomTatDanhGia(maCongThuc);
  const [diem, setDiem] = useState(5);
  const gui = useMutation({
    mutationFn: (d: number) => danhGiaCongThuc(maCongThuc, d),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cong-thuc', 'danh-gia', maCongThuc] }),
  });
  const phanBo = tomTat.data?.phanBo ?? {};
  const tong = tomTat.data?.tongSoDanhGia ?? 0;

  return (
    <View>
      <TitleText className="mt-2 text-lg">Đánh giá</TitleText>
      <View className="mt-2 flex-row items-center gap-3 rounded-2xl bg-mist p-3">
        <View className="items-center">
          <Text className="font-serif text-3xl font-black text-primary">
            {tong > 0 ? (tomTat.data?.diemTrungBinh ?? 0) : '—'}
          </Text>
          <CaptionText canLe="giua">{tong} lượt chấm</CaptionText>
        </View>
        <View className="flex-1 gap-1">
          {[5, 4, 3, 2, 1].map((sao) => {
            const so = Number(phanBo[String(sao)] ?? 0);
            const tyLe = tong > 0 ? Math.round((so / tong) * 100) : 0;
            return (
              <View key={sao} className="flex-row items-center gap-1.5">
                <Text className="w-6 text-right text-xs font-semibold text-neutral-600">{sao}★</Text>
                <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <View className="h-full rounded-full bg-star" style={{ width: `${tyLe}%` }} />
                </View>
                <Text className="w-6 text-xs text-neutral-500">{so}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View className="mt-2 flex-row items-center gap-3">
        <RatingStars diem={diem} khiChon={setDiem} />
        <NutBam
          tieuDe="Gửi"
          dangTai={gui.isPending}
          khiBam={() => gui.mutate(diem)}
          className="px-6 py-2"
        />
      </View>
      {gui.isSuccess ? <CaptionText className="mt-1 text-green-700">Đã ghi nhận điểm của bạn</CaptionText> : null}
    </View>
  );
};

// BR-SOC: Một bình luận tương tác được — trả lời, xem replies, sửa/xóa của mình
const TheBinhLuan: FC<{ maCongThuc: string; bl: BinhLuan; laCuaToi: boolean }> = ({
  maCongThuc,
  bl,
  laCuaToi,
}) => {
  const [moReplies, setMoReplies] = useState(false);
  const [dangTraLoi, setDangTraLoi] = useState(false);
  const [noiDungTraLoi, setNoiDungTraLoi] = useState('');
  const [dangSua, setDangSua] = useState(false);
  const [noiDungSua, setNoiDungSua] = useState(bl.noiDung);
  const replies = usePhanHoi(maCongThuc, moReplies ? bl.id : null);
  const traLoi = useTraLoiBinhLuan(maCongThuc);
  const sua = useSuaBinhLuan(maCongThuc);
  const xoa = useXoaBinhLuan(maCongThuc);

  return (
    <View className="rounded-2xl bg-mist p-3">
      <View className="flex-row items-center justify-between">
        <BodyText dam>{bl.tacGia.tenHienThi}</BodyText>
        <CaptionText>{dinhDangNgay(bl.thoiGianTao)}</CaptionText>
      </View>
      {dangSua ? (
        <View className="mt-1">
          <ONhapLieu giaTri={noiDungSua} khiDoi={setNoiDungSua} goiY="Sửa bình luận..." />
          <View className="mt-2 flex-row gap-2">
            <NutBam
              tieuDe="Lưu"
              dangTai={sua.isPending}
              voHieuHoa={!noiDungSua.trim()}
              khiBam={() => sua.mutate({ commentId: bl.id, noiDung: noiDungSua.trim() }, { onSuccess: () => setDangSua(false) })}
              className="flex-1"
            />
            <NutBam tieuDe="Hủy" bienThe="mo" khiBam={() => setDangSua(false)} className="flex-1" />
          </View>
        </View>
      ) : (
        <BodyText className="mt-1">{bl.noiDung}</BodyText>
      )}
      <View className="mt-1 flex-row items-center gap-3">
        <Pressable onPress={() => setDangTraLoi((v) => !v)}>
          <Text className="text-xs font-semibold text-deepteal">Trả lời</Text>
        </Pressable>
        {bl.soLuongPhanHoi > 0 ? (
          <Pressable onPress={() => setMoReplies((v) => !v)}>
            <Text className="text-xs text-neutral-500">
              {moReplies ? 'Ẩn' : 'Xem'} {bl.soLuongPhanHoi} phản hồi
            </Text>
          </Pressable>
        ) : null}
        {laCuaToi ? (
          <View className="ml-auto flex-row gap-3">
            <Pressable onPress={() => setDangSua((v) => !v)}>
              <Text className="text-xs font-semibold text-deepteal">Sửa</Text>
            </Pressable>
            <Pressable disabled={xoa.isPending} onPress={() => xoa.mutate(bl.id)}>
              <Text className="text-xs font-semibold text-red-500">Xóa</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {dangTraLoi ? (
        <View className="mt-2 flex-row gap-2">
          <View className="flex-1">
            <ONhapLieu giaTri={noiDungTraLoi} khiDoi={setNoiDungTraLoi} goiY={`Trả lời ${bl.tacGia.tenHienThi}...`} />
          </View>
          <NutBam
            tieuDe="Gửi"
            dangTai={traLoi.isPending}
            voHieuHoa={!noiDungTraLoi.trim()}
            khiBam={() =>
              traLoi.mutate({ chaId: bl.id, noiDung: noiDungTraLoi.trim() }, {
                onSuccess: () => {
                  setNoiDungTraLoi('');
                  setDangTraLoi(false);
                  setMoReplies(true);
                },
              })
            }
            className="px-4"
          />
        </View>
      ) : null}
      {moReplies && (replies.data?.noiDung.length ?? 0) > 0 ? (
        <View className="ml-4 mt-2 gap-2 border-l-2 border-neutral-200 pl-2">
          {replies.data?.noiDung.map((tl) => (
            <View key={tl.id}>
              <View className="flex-row items-center justify-between">
                <BodyText dam>{tl.tacGia.tenHienThi}</BodyText>
                <CaptionText>{dinhDangNgay(tl.thoiGianTao)}</CaptionText>
              </View>
              <BodyText className="mt-0.5 text-sm">{tl.noiDung}</BodyText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default function ManHinhChiTietCongThuc() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const maCongThuc = Array.isArray(id) ? id[0] : (id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);

  const { data, isLoading, isError, refetch } = useChiTietCongThuc(maCongThuc);
  // BR-FORK: Bản riêng tư của mình từ món này (có thì hiện nút xem, chưa thì hiện nút fork)
  const banCaNhan = useBanCaNhan(maCongThuc, !!nguoiDung);
  const forkBanRieng = useForkCongThuc();
  const tuongTu = useCongThucTuongTu(maCongThuc);
  const dsBinhLuan = useBinhLuan(maCongThuc);
  // BR-SOC: Trạng thái yêu thích đồng bộ server (suy từ danh sách đã lưu)
  const dsYeuThich = useDanhSachYeuThich(0, 100);
  const dangYeuThich = useMemo(
    () => (dsYeuThich.data?.noiDung ?? []).some((ct) => ct.id === maCongThuc),
    [dsYeuThich.data, maCongThuc],
  );
  const chuyenYeuThich = useChuyenDoiYeuThich(maCongThuc, dangYeuThich);
  const [binhLuan, setBinhLuan] = useState('');
  const taoBinhLuan = useTaoBinhLuan(maCongThuc);
  const xoaCongThuc = useXoaCongThuc();
  // BR-SHOP: Thêm hết nguyên liệu vào giỏ (server gộp + scale theo khẩu phần đang chọn)
  const taoGioDiCho = useTaoTuCongThuc();
  // BR-UI: Chia sẻ công thức qua Share sheet của hệ điều hành
  const chiaSe = () => {
    if (!data) return;
    Share.share({ message: `${data.ten}${data.moTa ? ` — ${data.moTa}` : ''}` }).catch(() => {});
  };
  // BR-04: Khẩu phần người xem chọn để quy đổi định lượng (mặc định = khẩu phần gốc)
  // Cá nhân hóa: nhớ riêng từng món qua SecureStore để đi chợ dùng đúng
  const [khauPhanChon, setKhauPhanChon] = useState<number | null>(null);
  useEffect(() => {
    import('expo-secure-store')
      .then((m) => m.getItemAsync(`canhan:${maCongThuc}`))
      .then((v) => {
        const so = Number(v);
        if (Number.isFinite(so) && so >= 1) setKhauPhanChon(so);
      })
      .catch(() => {});
  }, [maCongThuc]);
  const doiKhauPhanCaNhan = (v: number) => {
    setKhauPhanChon(v);
    import('expo-secure-store').then((m) => m.setItemAsync(`canhan:${maCongThuc}`, String(v)).catch(() => {}));
  };

  const [themVaoKeHoach, setThemVaoKeHoach] = useState(false);
  const [keHoachChon, setKeHoachChon] = useState('');
  const [ngayAn, setNgayAn] = useState(() => homNay());
  const [buoiAn, setBuoiAn] = useState(() => buoiGoiYTheoGio());
  const [khauPhanAn, setKhauPhanAn] = useState(2);
  const [loiLuuMon, setLoiLuuMon] = useState('');
  const danhSachKeHoach = useDanhSachKeHoachAn();
  // BR-MEAL: Mở sheet là chọn sẵn kế hoạch đầu để khỏi bấm thêm 1 nhịp
  useEffect(() => {
    if (themVaoKeHoach && !keHoachChon) {
      const dau = danhSachKeHoach.data?.noiDung[0]?.id;
      if (dau) setKeHoachChon(dau);
    }
  }, [themVaoKeHoach, danhSachKeHoach.data, keHoachChon]);
  const luuMonVaoKeHoach = useMutation({
    mutationFn: () =>
      themMonVaoKeHoach(keHoachChon, {
        congThucId: maCongThuc,
        ngay: ngayAn.trim(),
        buoiAn,
        khauPhan: khauPhanAn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: khoaTruyVan.keHoachAn.chiTiet(keHoachChon) });
      setThemVaoKeHoach(false);
    },
  });

  const [tabHienTai, setTabHienTai] = useState(0);

  if (isLoading) return <TrangDangTai />;
  if (isError || !data)
    return (
      <SafeAreaView className="flex-1 bg-white">
        <TrangLoi loi="Không tải được công thức" khiThuLai={() => refetch()} />
      </SafeAreaView>
    );

  const laTacGia = nguoiDung?.id === data.tacGia.id;
  const khauPhanHienTai = khauPhanChon ?? data.khauPhan;
  const tiLeQuyDoi = data.khauPhan > 0 ? khauPhanHienTai / data.khauPhan : 1;
  // BR-ANTOAN: Check local từ nguyên liệu đang hiện — offline vẫn báo
  const canhBaoDoc = useMemo(
    () => kiemTraComboDoc((data?.nguyenLieu ?? []).map((nl) => nl.ten)),
    [data],
  );

  const thanhPhanNguyenLieu = (
    <View>
      <View className="flex-row items-center justify-between">
        <CaptionText className="font-medium">{data.nguyenLieu.length} món</CaptionText>
        <Pressable
          accessibilityRole="button"
          onPress={() => taoGioDiCho.mutate({ congThucId: maCongThuc, khauPhan: khauPhanHienTai })}
          className="flex-row items-center gap-1.5 rounded-xl bg-primary px-4 py-2"
        >
          <Plus size={14} color="#fff" />
          <Text className="text-sm font-semibold text-white">
            {taoGioDiCho.isPending ? 'Đang thêm...' : 'Thêm hết vào giỏ'}
          </Text>
        </Pressable>
      </View>
      <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-mist px-4 py-3">
        <CaptionText className="font-medium">Khẩu phần quy đổi</CaptionText>
        <View className="flex-row items-center gap-2.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Giảm khẩu phần"
            onPress={() => doiKhauPhanCaNhan(Math.max(1, khauPhanHienTai - 1))}
            className="h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white"
          >
            <Minus size={15} color={MAU_SAC.MUC} />
          </Pressable>
          <Text className="min-w-16 text-center text-base font-bold tabular-nums text-primary">
            {formatVn(khauPhanHienTai)} người
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tăng khẩu phần"
            onPress={() => doiKhauPhanCaNhan(Math.min(20, khauPhanHienTai + 1))}
            className="h-8 w-8 items-center justify-center rounded-full bg-primary"
          >
            <Plus size={15} color="#fff" />
          </Pressable>
        </View>
      </View>
      {data.nguyenLieu.map((nl, i) => (
        <HangNguyenLieu
          key={i}
          ten={nl.ten}
          dinhLuong={nl.dinhLuong}
          donVi={nl.donVi}
          tiLe={tiLeQuyDoi}
        />
      ))}
    </View>
  );

  const thanhPhanBuoc = (
    <View>
      {data.cacBuoc.map((buoc) => (
        <View key={buoc.thuTu} className="mt-3 flex-row gap-3">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-accent-light">
            <Text className="text-sm font-bold text-primary">{buoc.thuTu}</Text>
          </View>
          <View className="flex-1">
            <BodyText>{buoc.noiDung}</BodyText>
            {buoc.anhBuoc ? (
              <Image
                source={{ uri: layUrlAnh(buoc.anhBuoc) }}
                style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 8 }}
                contentFit="cover"
              />
            ) : null}
          </View>
        </View>
      ))}
      {data.dinhDuong ? (
        <View className="mt-6 rounded-2xl bg-mist p-4">
          <BodyText dam>Dinh dưỡng</BodyText>
          <View className="mt-2 flex-row justify-between">
            <CaptionText>Calo</CaptionText>
            <NumberDisplay value={data.dinhDuong.calo} unit="kcal" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Protein</CaptionText>
            <NumberDisplay value={parseFloat(String(data.dinhDuong.protein))} unit="g" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Carb</CaptionText>
            <NumberDisplay value={parseFloat(String(data.dinhDuong.carb))} unit="g" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Chất béo</CaptionText>
            <NumberDisplay value={parseFloat(String(data.dinhDuong.chatBeo))} unit="g" className="text-sm" />
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="relative">
          {data.anhThumbnail ? (
            <Image source={{ uri: layUrlAnh(data.anhThumbnail) }} style={{ width: '100%', height: 260 }} contentFit="cover" />
          ) : (
            <View className="h-40 w-full items-center justify-center bg-cream">
              <Text className="font-serif text-5xl font-black text-accent-dark">{data.ten.trim().charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View className="absolute left-4 top-4 flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronLeft size={20} color="#0A2533" />
            </Pressable>
          </View>
          <View className="absolute right-4 top-4 flex-row gap-2">
            <Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ" onPress={chiaSe} className="h-9 w-9 items-center justify-center rounded-full bg-white/90">
              <Share2 size={18} color="#0A2533" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yêu thích"
              onPress={() => chuyenYeuThich.mutate(undefined)}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/90"
            >
              <Heart size={18} color={dangYeuThich ? '#CA4844' : '#0A2533'} fill={dangYeuThich ? '#CA4844' : 'transparent'} />
            </Pressable>
          </View>
        </View>

        <View className="px-4 pt-4">
          <TitleText className="text-3xl" soDongToiDa={3}>{data.ten}</TitleText>
          <View className="mt-3 flex-row items-center gap-3">
            <Avatar nguon={data.tacGia.anhDaiDien} ten={data.tacGia.tenHienThi} kichThuoc={40} />
            <View className="flex-1">
              <BodyText dam>{data.tacGia.tenHienThi}</BodyText>
              <CaptionText>Tác giả công thức • {dinhDangNgay(data.ngayTao)}</CaptionText>
            </View>
          </View>

          <View className="mt-4 flex-row gap-2">
            <TheThongTin
              nhan="Chuẩn bị"
              giaTri={data.thoiGianChuanBiPhut ? `${formatVn(data.thoiGianChuanBiPhut)} phút` : '—'}
              Icon={Hourglass}
            />
            <TheThongTin nhan="Nấu chín" giaTri={`${formatVn(data.thoiGianNauPhut)} phút`} Icon={Clock} />
            <TheThongTin nhan="Khẩu phần" giaTri={`${formatVn(khauPhanHienTai)} người`} Icon={Users} />
            <TheThongTin
              nhan="Năng lượng"
              giaTri={
                data.dinhDuong
                  ? `${formatVn(data.dinhDuong.calo)} kcal`
                  : data.caloUocTinh
                    ? `~${formatVn(data.caloUocTinh)} kcal`
                    : '—'
              }
              Icon={Flame}
            />
          </View>

          {data.moTa ? <BodyText className="mt-3 text-neutral-600" soDongToiDa={3}>{data.moTa}</BodyText> : null}

          {canhBaoDoc.map((cb) => (
            <View
              key={cb.cap.join('+')}
              className={`mt-3 rounded-2xl border p-3 ${cb.muc === 'cao' ? 'border-red-500 bg-red-50' : 'border-amber-400 bg-amber-50'}`}
            >
              <Text className={`text-left text-sm font-bold ${cb.muc === 'cao' ? 'text-red-700' : 'text-amber-700'}`}>
                {cb.muc === 'cao' ? 'Cảnh báo: combo kỵ nhau' : 'Lưu ý khi kết hợp'}
              </Text>
              <BodyText className="mt-1 text-sm">{cb.lyDo}</BodyText>
            </View>
          ))}

          {laTacGia ? (
            <View className="mt-3 flex-row gap-2">
              <NutBam tieuDe="Sửa" bienThe="phu" khiBam={() => router.push(`/recipe/create?id=${maCongThuc}`)} className="flex-1" />
              <NutBam
                tieuDe="Xóa"
                bienThe="mo"
                khiBam={() => xoaCongThuc.mutate(maCongThuc, { onSuccess: () => router.back() })}
                className="flex-1"
              />
            </View>
          ) : nguoiDung ? (
            // BR-FORK: Món người khác — fork 1 chạm sang bản riêng tư rồi mở luôn để sửa
            <View className="mt-3 flex-row gap-2">
              {banCaNhan.data ? (
                <NutBam
                  tieuDe="Xem bản của tôi"
                  bienThe="phu"
                  khiBam={() => router.push(`/recipe/${banCaNhan.data?.id ?? ''}`)}
                  className="flex-1"
                />
              ) : (
                <NutBam
                  tieuDe="Sửa theo ý tôi"
                  bienThe="phu"
                  dangTai={forkBanRieng.isPending}
                  khiBam={() =>
                    forkBanRieng.mutate(maCongThuc, {
                      onSuccess: (banFork) => router.push(`/recipe/${banFork.id}`),
                    })
                  }
                  className="flex-1"
                />
              )}
            </View>
          ) : null}
        </View>

        <View className="mt-4">
          <TabBar cacTab={[...CAC_TAB]} tabHienTai={tabHienTai} khiChon={setTabHienTai} />
          <View className="px-4 py-4">
            {tabHienTai === 0 ? thanhPhanNguyenLieu : null}
            {tabHienTai === 1 ? thanhPhanBuoc : null}
          </View>
        </View>

        <View className="px-4">
          <KhoiDanhGia maCongThuc={maCongThuc} />

          <TitleText className="mt-6 text-lg">Bình luận</TitleText>
          <View className="mt-2 flex-row gap-2">
            <View className="flex-1">
              <ONhapLieu giaTri={binhLuan} khiDoi={setBinhLuan} goiY="Viết bình luận..." />
            </View>
            <NutBam
              tieuDe="Gửi"
              dangTai={taoBinhLuan.isPending}
              voHieuHoa={!binhLuan.trim()}
              khiBam={() => taoBinhLuan.mutate(binhLuan.trim(), { onSuccess: () => setBinhLuan('') })}
              className="px-5"
            />
          </View>
          {(dsBinhLuan.data?.noiDung.length ?? 0) > 0 ? (
            <View className="mt-3 gap-3">
              {dsBinhLuan.data?.noiDung.map((bl) => (
                <TheBinhLuan
                  key={bl.id}
                  maCongThuc={maCongThuc}
                  bl={bl}
                  laCuaToi={nguoiDung?.id === bl.tacGia.id}
                />
              ))}
            </View>
          ) : null}

          {(tuongTu.data?.noiDung.length ?? 0) > 0 ? (
            <View className="mt-6">
              <TitleText className="text-lg">Món tương tự</TitleText>
              <DanhSachCongThuc
                duLieu={tuongTu.data?.noiDung ?? []}
                dangTai={tuongTu.isLoading}
                khiChon={(idMoi) => router.push(`/recipe/${idMoi}`)}
                bienThe="compact"
              />
            </View>
          ) : null}
          <View className="h-24" />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-2 border-t border-neutral-200 bg-white px-4 py-3">
        <NutBam
          tieuDe={dangYeuThich ? 'Đã thích' : 'Yêu thích'}
          bienThe={dangYeuThich ? 'chinh' : 'vien'}
          dangTai={chuyenYeuThich.isPending}
          khiBam={() => chuyenYeuThich.mutate(undefined)}
          className="flex-1 py-2"
        />
        <NutBam tieuDe="+ Kế hoạch" bienThe="chinh" khiBam={() => setThemVaoKeHoach(true)} className="flex-1 py-2" />
      </View>

      <BottomSheet hienThi={themVaoKeHoach} tieuDe="Thêm vào kế hoạch ăn" khiDong={() => { setThemVaoKeHoach(false); setLoiLuuMon(''); }}>
        <ScrollView>
          <CaptionText className="mt-2 font-semibold">Chọn kế hoạch</CaptionText>
          <View className="mt-2 gap-2">
            {(danhSachKeHoach.data?.noiDung ?? []).map((kh) => (
              <Pressable
                key={kh.id}
                onPress={() => setKeHoachChon(kh.id)}
                className={`rounded-xl border px-3 py-2 ${keHoachChon === kh.id ? 'border-primary bg-accent-light' : 'border-neutral-300'}`}
              >
                <BodyText>{kh.ten}</BodyText>
              </Pressable>
            ))}
          </View>
          <View className="mt-3">
            <DaiNgay ngayChon={ngayAn} khiChon={setNgayAn} />
          </View>
          <View className="mt-2 flex-row gap-2">
            {[
              { nhan: 'Trưa nay', ngay: homNay(), buoi: 'LUNCH' },
              { nhan: 'Tối nay', ngay: homNay(), buoi: 'DINNER' },
              { nhan: 'Trưa mai', ngay: congNgay(homNay(), 1), buoi: 'LUNCH' },
            ].map((goiY) => (
              <Pressable
                key={goiY.nhan}
                accessibilityRole="button"
                onPress={() => {
                  setNgayAn(goiY.ngay);
                  setBuoiAn(goiY.buoi);
                }}
                className={`rounded-full px-3 py-1.5 ${
                  ngayAn === goiY.ngay && buoiAn === goiY.buoi ? 'bg-primary' : 'bg-neutral-200'
                }`}
              >
                <Text
                  className={`text-xs ${
                    ngayAn === goiY.ngay && buoiAn === goiY.buoi ? 'font-semibold text-white' : 'text-neutral-700'
                  }`}
                >
                  {goiY.nhan}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-3">
            <ChonBuoiAn buoiChon={buoiAn} khiChon={setBuoiAn} />
          </View>
          <View className="mt-3">
            <TangGiamKhauPhan khauPhan={khauPhanAn} khiDoi={setKhauPhanAn} />
          </View>
          {loiLuuMon ? <CaptionText className="mt-2 text-red-500">{loiLuuMon}</CaptionText> : null}
          {luuMonVaoKeHoach.isError ? (
            <CaptionText className="mt-2 text-red-500">Không lưu được, thử lại sau</CaptionText>
          ) : null}
          <NutBam
            tieuDe="Lưu vào kế hoạch"
            dangTai={luuMonVaoKeHoach.isPending}
            voHieuHoa={!keHoachChon || !ngayAn.trim()}
            khiBam={() => {
              if (!keHoachChon) {
                setLoiLuuMon('Hãy chọn một kế hoạch (hoặc tạo mới ở màn Kế hoạch)');
                return;
              }
              setLoiLuuMon('');
              luuMonVaoKeHoach.mutate();
            }}
            className="mt-4 mb-2"
          />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
