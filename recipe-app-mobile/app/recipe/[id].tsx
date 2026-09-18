import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { FC } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, Clock, Heart, Minus, Plus, Share2, Users } from 'lucide-react-native';
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
import { dinhDangNgay } from '../../src/lib/utils/dinh-dang';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { danhGiaCongThuc } from '../../src/lib/api/recipes';
import { themMonVaoKeHoach } from '../../src/lib/api/mealPlans';
import { khoaTruyVan } from '../../src/lib/queryClient';
import { useAuthStore } from '../../src/stores/authStore';
import {
  useChiTietCongThuc,
  useChuyenDoiYeuThich,
  useCongThucTuongTu,
  useTaoBinhLuan,
  useXoaCongThuc,
} from '../../src/hooks/useRecipes';
import { useDanhSachKeHoachAn } from '../../src/hooks/useMealShopping';

// SVG gốc: 2 tab Ingredients / Instructions (không có tab Nutrition riêng)
const CAC_TAB = ['Nguyên liệu', 'Hướng dẫn'] as const;

const BUOI_AN = [
  { giaTri: 'BREAKFAST', nhan: 'Sáng' },
  { giaTri: 'LUNCH', nhan: 'Trưa' },
  { giaTri: 'DINNER', nhan: 'Tối' },
  { giaTri: 'SNACK', nhan: 'Phụ' },
] as const;

// Hàng nguyên liệu kiểu SVG: ảnh/tên + nút − số lượng +
const HangNguyenLieu: FC<{
  ten: string;
  soLuong: number;
  khiDoi: (so: number) => void;
}> = ({ ten, soLuong, khiDoi }) => (
  <View className="flex-row items-center justify-between border-b border-neutral-100 py-3">
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-cream">
      <Text className="text-lg font-bold text-accent">{ten.trim().charAt(0).toUpperCase()}</Text>
    </View>
    <BodyText className="flex-1 px-3" soDongToiDa={2}>
      {ten}
    </BodyText>
    <View className="flex-row items-center gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Bớt ${ten}`}
        onPress={() => khiDoi(Math.max(0, soLuong - 1))}
        className="h-7 w-7 items-center justify-center rounded-full border border-neutral-300"
      >
        <Minus size={14} color="#0A2533" />
      </Pressable>
      <Text className="w-6 text-center text-base font-semibold text-primary">{soLuong}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Thêm ${ten}`}
        onPress={() => khiDoi(soLuong + 1)}
        className="h-7 w-7 items-center justify-center rounded-full bg-primary"
      >
        <Plus size={14} color="#fff" />
      </Pressable>
    </View>
  </View>
);

export default function ManHinhChiTietCongThuc() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const maCongThuc = Array.isArray(id) ? id[0] : (id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);

  const { data, isLoading, isError, refetch } = useChiTietCongThuc(maCongThuc);
  const tuongTu = useCongThucTuongTu(maCongThuc);
  const [dangYeuThich, setDangYeuThich] = useState(false);
  const chuyenYeuThich = useChuyenDoiYeuThich(maCongThuc, dangYeuThich);
  const [diem, setDiem] = useState(5);
  const guiDanhGia = useMutation({ mutationFn: (d: number) => danhGiaCongThuc(maCongThuc, d) });
  const [binhLuan, setBinhLuan] = useState('');
  const taoBinhLuan = useTaoBinhLuan(maCongThuc);
  const xoaCongThuc = useXoaCongThuc();
  const [soLuongNguyenLieu, setSoLuongNguyenLieu] = useState<Record<string, number>>({});

  const [themVaoKeHoach, setThemVaoKeHoach] = useState(false);
  const [keHoachChon, setKeHoachChon] = useState('');
  const [ngayAn, setNgayAn] = useState('');
  const [buoiAn, setBuoiAn] = useState('LUNCH');
  const [khauPhanAn, setKhauPhanAn] = useState('2');
  const danhSachKeHoach = useDanhSachKeHoachAn();
  const luuMonVaoKeHoach = useMutation({
    mutationFn: () =>
      themMonVaoKeHoach(keHoachChon, {
        congThucId: maCongThuc,
        ngay: ngayAn.trim(),
        buoiAn,
        khauPhan: parseInt(khauPhanAn, 10) || 1,
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

  const thanhPhanNguyenLieu = (
    <View>
      <View className="flex-row items-center justify-between">
        <CaptionText className="font-medium">{data.nguyenLieu.length} món</CaptionText>
        <Pressable accessibilityRole="button" className="flex-row items-center gap-1.5 rounded-xl bg-primary px-4 py-2">
          <Plus size={14} color="#fff" />
          <Text className="text-sm font-semibold text-white">Thêm hết vào giỏ</Text>
        </Pressable>
      </View>
      {data.nguyenLieu.map((nl, i) => (
        <HangNguyenLieu
          key={i}
          ten={nl.ten}
          soLuong={soLuongNguyenLieu[nl.ten] ?? 1}
          khiDoi={(so) => setSoLuongNguyenLieu((t) => ({ ...t, [nl.ten]: so }))}
        />
      ))}
    </View>
  );

  const thanhPhanBuoc = (
    <View>
      {data.cacBuoc.map((buoc) => (
        <View key={buoc.thuTu} className="mt-3 flex-row gap-3">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
            <Text className="text-sm font-bold text-white">{buoc.thuTu}</Text>
          </View>
          <BodyText className="flex-1">{buoc.noiDung}</BodyText>
        </View>
      ))}
      {data.dinhDuong ? (
        <View className="mt-6 rounded-2xl bg-[#F1F5F5] p-4">
          <BodyText dam>Dinh dưỡng</BodyText>
          <View className="mt-2 flex-row justify-between">
            <CaptionText>Calo</CaptionText>
            <NumberDisplay value={data.dinhDuong.calo} unit="kcal" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Protein</CaptionText>
            <NumberDisplay value={parseFloat(data.dinhDuong.protein)} unit="g" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Carb</CaptionText>
            <NumberDisplay value={parseFloat(data.dinhDuong.carb)} unit="g" className="text-sm" />
          </View>
          <View className="mt-1 flex-row justify-between">
            <CaptionText>Chất béo</CaptionText>
            <NumberDisplay value={parseFloat(data.dinhDuong.chatBeo)} unit="g" className="text-sm" />
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
              <Text className="text-5xl font-bold text-accent">{data.ten.trim().charAt(0).toUpperCase()}</Text>
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
            <Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ" className="h-9 w-9 items-center justify-center rounded-full bg-white/90">
              <Share2 size={18} color="#0A2533" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yêu thích"
              onPress={() => chuyenYeuThich.mutate(undefined, { onSuccess: () => setDangYeuThich((v) => !v) })}
              className="h-9 w-9 items-center justify-center rounded-full bg-white/90"
            >
              <Heart size={18} color={dangYeuThich ? '#CA4844' : '#0A2533'} fill={dangYeuThich ? '#CA4844' : 'transparent'} />
            </Pressable>
          </View>
        </View>

        <View className="px-4 pt-4">
          <TitleText className="text-2xl">{data.ten}</TitleText>
          <View className="mt-3 flex-row items-center gap-3">
            <Avatar nguon={data.tacGia.anhDaiDien} ten={data.tacGia.tenHienThi} kichThuoc={40} />
            <View className="flex-1">
              <BodyText dam>{data.tacGia.tenHienThi}</BodyText>
              <CaptionText>Tác giả công thức • {dinhDangNgay(data.ngayTao)}</CaptionText>
            </View>
          </View>

          <View className="mt-3 flex-row gap-4">
            <View className="flex-row items-center gap-1">
              <Clock size={14} color="#97A2B0" />
              <NumberDisplay value={data.thoiGianNauPhut} unit="phút" className="text-sm" />
            </View>
            {data.thoiGianChuanBiPhut ? (
              <View className="flex-row items-center gap-1">
                <CaptionText>Chuẩn bị</CaptionText>
                <NumberDisplay value={data.thoiGianChuanBiPhut} unit="phút" className="text-sm" />
              </View>
            ) : null}
            <View className="flex-row items-center gap-1">
              <Users size={14} color="#97A2B0" />
              <NumberDisplay value={data.khauPhan} unit="người" className="text-sm" />
            </View>
          </View>

          {data.moTa ? <BodyText className="mt-3 text-neutral-600" soDongToiDa={3}>{data.moTa}</BodyText> : null}

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
          <TitleText className="mt-2 text-lg">Đánh giá</TitleText>
          <View className="mt-2 flex-row items-center gap-3">
            <RatingStars diem={diem} khiChon={setDiem} />
            <NutBam tieuDe="Gửi" dangTai={guiDanhGia.isPending} khiBam={() => guiDanhGia.mutate(diem)} className="px-6 py-2" />
          </View>

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
          khiBam={() => chuyenYeuThich.mutate(undefined, { onSuccess: () => setDangYeuThich((v) => !v) })}
          className="flex-1 py-2"
        />
        <NutBam tieuDe="+ Kế hoạch" bienThe="chinh" khiBam={() => setThemVaoKeHoach(true)} className="flex-1 py-2" />
      </View>

      <BottomSheet hienThi={themVaoKeHoach} tieuDe="Thêm vào kế hoạch ăn" khiDong={() => setThemVaoKeHoach(false)}>
        <ScrollView>
          <CaptionText className="mt-2">Chọn kế hoạch</CaptionText>
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
          <ONhapLieu nhan="Ngày ăn (YYYY-MM-DD)" giaTri={ngayAn} khiDoi={setNgayAn} goiY="2026-09-12" className="mt-3" />
          <View className="mt-3 flex-row gap-2">
            {BUOI_AN.map((buoi) => (
              <Pressable
                key={buoi.giaTri}
                onPress={() => setBuoiAn(buoi.giaTri)}
                className={`flex-1 items-center rounded-lg border py-2 ${buoiAn === buoi.giaTri ? 'border-primary bg-accent-light' : 'border-neutral-300'}`}
              >
                <Text className="text-xs text-neutral-900">{buoi.nhan}</Text>
              </Pressable>
            ))}
          </View>
          <ONhapLieu nhan="Khẩu phần" giaTri={khauPhanAn} khiDoi={setKhauPhanAn} banPhim="numeric" className="mt-3" />
          <NutBam
            tieuDe="Lưu vào kế hoạch"
            dangTai={luuMonVaoKeHoach.isPending}
            voHieuHoa={!keHoachChon || !ngayAn.trim()}
            khiBam={() => luuMonVaoKeHoach.mutate()}
            className="mt-4 mb-2"
          />
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
