import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { layUrlAnh } from '../../src/lib/utils/anh';
import { DanhSachCongThuc } from '../../src/components/recipe/DanhSachCongThuc';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { CaptionText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { useDanhSachCongThuc } from '../../src/hooks/useRecipes';
import type { ThamSoDanhSachCongThuc } from '../../src/lib/api/recipes';
import type { CongThuc } from '../../src/types/api';
import { useDebounce } from '../../src/hooks/useDebounce';
import { boNhoCongThuc } from '../../src/lib/db/recipeRepository';

const KIEU_AN = ['Chay', 'Vegan', 'Keto', 'Không gluten'] as const;
const DO_KHO = ['Dễ', 'Trung bình', 'Khó'] as const;
const THOI_GIAN = ['< 15 phút', '< 30 phút', '< 60 phút', 'Bất kỳ'] as const;
const MOC_KHAU_PHAN = [2, 4, 6] as const;
const KICH_THUOC_TRANG = 10;

// BR-UI: Độ khó suy từ thời gian nấu (backend chưa có trường riêng)
const DO_KHO_SANG_PHUT: Record<(typeof DO_KHO)[number], { minCookTime?: number; maxCookTime?: number }> = {
  Dễ: { maxCookTime: 30 },
  'Trung bình': { maxCookTime: 60 },
  Khó: { minCookTime: 60 },
};

// BR-REC: Header editorial + gợi ý trực tiếp + tải thêm, đồng bộ web TimKiem
export default function ManHinhTimKiem() {
  const router = useRouter();
  // BR-UI: Nhận từ khóa nhanh từ trang chủ (params.tuKhoa) để điền sẵn ô tìm kiếm
  const thamSoDieuHuong = useLocalSearchParams<{ tuKhoa?: string | string[] }>();
  const tuKhoaDieuHuong = Array.isArray(thamSoDieuHuong.tuKhoa)
    ? (thamSoDieuHuong.tuKhoa[0] ?? '')
    : (thamSoDieuHuong.tuKhoa ?? '');
  const [tuKhoa, setTuKhoa] = useState(tuKhoaDieuHuong);
  const [lichSu, setLichSu] = useState<string[]>([]);
  const [moFilter, setMoFilter] = useState(false);
  const [kieuAnChon, setKieuAnChon] = useState<string | null>(null);
  const [thoiGianChon, setThoiGianChon] = useState<number | null>(null);
  const [doKhoChon, setDoKhoChon] = useState<(typeof DO_KHO)[number] | null>(null);
  const [khauPhanChon, setKhauPhanChon] = useState<number | null>(null);
  const [sapXep, setSapXep] = useState<'moi' | 'nhanh'>('moi');
  const [trang, setTrang] = useState(0);
  const [tichLuy, setTichLuy] = useState<CongThuc[]>([]);
  const tuKhoaTre = useDebounce(tuKhoa.trim(), 400);

  // BR-UI: Thời gian chọn tay thắng độ khó; chưa chọn thời gian thì dùng ngưỡng độ khó
  const gioiHanDoKho = doKhoChon && thoiGianChon === null ? DO_KHO_SANG_PHUT[doKhoChon] : {};
  const gioiHanThoiGian = thoiGianChon ?? gioiHanDoKho.maxCookTime ?? gioiHanDoKho.minCookTime;
  const chiChieuTren = gioiHanDoKho.maxCookTime !== undefined || thoiGianChon !== null;
  // BR-REC: BE chỉ lọc page/size/search/tacGiaId, các filter còn lại lọc client-side ở ketQua
  const thamSo: ThamSoDanhSachCongThuc = {
    page: trang,
    size: KICH_THUOC_TRANG,
    ...(tuKhoaTre.length > 0 ? { search: tuKhoaTre } : {}),
  };
  const { data, isLoading, isFetching, isError, error, refetch } = useDanhSachCongThuc(thamSo);

  const soFilterDangBat =
    (kieuAnChon ? 1 : 0) + (thoiGianChon ? 1 : 0) + (doKhoChon ? 1 : 0) + (khauPhanChon ? 1 : 0);

  // BR-REC: Đổi filter thì tải lại từ trang 0, lật trang thì nối thêm kết quả
  useEffect(() => {
    setTrang(0);
    setTichLuy([]);
  }, [tuKhoaTre, kieuAnChon, thoiGianChon, doKhoChon, khauPhanChon]);

  useEffect(() => {
    if (!data) return;
    setTichLuy((cu) => {
      if (trang === 0) return data.noiDung;
      const daCo = new Set(cu.map((ct) => ct.id));
      return [...cu, ...data.noiDung.filter((ct) => !daCo.has(ct.id))];
    });
  }, [data, trang]);

  const ketQua = useMemo(() => {
    let ds = [...tichLuy];
    // BR-REC: Lọc client-side vì BE chưa hỗ trợ diet/thời gian/khẩu phần
    if (kieuAnChon) {
      const tu = kieuAnChon.toLowerCase();
      ds = ds.filter(
        (ct) =>
          ct.ten.toLowerCase().includes(tu) ||
          (ct.moTa ?? '').toLowerCase().includes(tu),
      );
    }
    if (gioiHanThoiGian !== undefined) {
      ds = ds.filter((ct) =>
        chiChieuTren ? ct.thoiGianNauPhut <= gioiHanThoiGian : ct.thoiGianNauPhut >= gioiHanThoiGian,
      );
    }
    if (khauPhanChon) ds = ds.filter((ct) => ct.khauPhan >= khauPhanChon);
    if (sapXep === 'nhanh') ds.sort((a, b) => a.thoiGianNauPhut - b.thoiGianNauPhut);
    return ds;
  }, [tichLuy, sapXep, kieuAnChon, gioiHanThoiGian, chiChieuTren, khauPhanChon]);

  const goiY = ketQua.slice(0, 3);
  const tongSo = data?.tongSoPhanTu ?? 0;
  const tongTrang = data?.tongSoTrang ?? 0;

  useEffect(() => {
    boNhoCongThuc.layTuKhoa().then(setLichSu).catch(() => {});
  }, []);

  // BR-UI: Đồng bộ khi trang chủ đẩy từ khóa nhanh sang (params đổi → điền lại ô tìm kiếm)
  useEffect(() => {
    if (tuKhoaDieuHuong.length > 0) setTuKhoa(tuKhoaDieuHuong);
  }, [tuKhoaDieuHuong]);

  useEffect(() => {
    if (tuKhoaTre.length === 0) {
      boNhoCongThuc.layTuKhoa().then(setLichSu).catch(() => {});
      return;
    }
    const henGio = setTimeout(() => {
      boNhoCongThuc
        .luuTuKhoa(tuKhoaTre)
        .then(() => boNhoCongThuc.layTuKhoa())
        .then(setLichSu)
        .catch(() => {});
    }, 800);
    return () => clearTimeout(henGio);
  }, [tuKhoaTre]);

  const xoaHetFilter = () => {
    setKieuAnChon(null);
    setThoiGianChon(null);
    setDoKhoChon(null);
    setKhauPhanChon(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-mist">
      <View className="px-4 pb-2 pt-4">
        <CaptionText canLe="giua" className="font-bold uppercase tracking-widest text-deepteal">
          Kho tàng hương vị thuần Việt
        </CaptionText>
        <Text className="mt-1 text-center font-serif text-3xl font-black text-primary">
          Hôm nay gian bếp nấu món gì?
        </Text>

        <View className="mt-4 flex-row items-center gap-2">
          <View className="flex-1">
            <ONhapLieu
              giaTri={tuKhoa}
              khiDoi={setTuKhoa}
              goiY="Tìm món ăn, nguyên liệu..."
              bieuTuong={<Search size={18} color="#97A2B0" />}
            />
          </View>
          {tuKhoa ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xóa từ khóa"
              onPress={() => setTuKhoa('')}
              className="h-12 w-10 items-center justify-center"
            >
              <X size={18} color="#97A2B0" />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bộ lọc"
            onPress={() => setMoFilter(true)}
            className="relative h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white"
          >
            <SlidersHorizontal size={20} color="#0A2533" />
            {soFilterDangBat > 0 ? (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Text className="text-[10px] font-bold text-white">{soFilterDangBat}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {tuKhoaTre.length > 0 && goiY.length > 0 ? (
          <View className="mt-2 rounded-2xl bg-white p-2 shadow-sm">
            <CaptionText className="px-3 py-1 font-bold uppercase">
              Gợi ý trực tiếp • {goiY.length} kết quả nhanh
            </CaptionText>
            {goiY.map((ct) => (
              <Pressable
                key={ct.id}
                accessibilityRole="button"
                onPress={() => router.push(`/recipe/${ct.id}`)}
                className="flex-row items-center gap-3 rounded-xl px-3 py-2"
              >
                {ct.anhThumbnail ? (
                  <Image
                    source={{ uri: layUrlAnh(ct.anhThumbnail) }}
                    style={{ width: 44, height: 44, borderRadius: 12 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="h-11 w-11 items-center justify-center rounded-xl bg-cream">
                    <Text className="text-base font-bold text-accent-dark">
                      {ct.ten.trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <Text className="text-left text-sm font-medium text-primary" numberOfLines={1}>
                    {ct.ten}
                  </Text>
                  <Text className="text-left text-xs text-neutral-500" numberOfLines={1}>
                    {ct.tacGia.tenHienThi}
                    {ct.nguyenLieu.length > 0
                      ? ` • ${ct.nguyenLieu.slice(0, 3).map((nl) => nl.ten).join(', ')}`
                      : ''}
                  </Text>
                </View>
                <ArrowRight size={16} color="#97A2B0" />
              </Pressable>
            ))}
          </View>
        ) : null}

        {tuKhoaTre.length === 0 && lichSu.length > 0 ? (
          <View className="mt-3">
            <CaptionText>Tìm gần đây</CaptionText>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {lichSu.map((tu) => (
                <Pressable
                  key={tu}
                  onPress={() => setTuKhoa(tu)}
                  className="flex-row items-center gap-1 rounded-full bg-neutral-200 px-3 py-1.5"
                >
                  <Text className="text-left text-sm text-neutral-800">{tu}</Text>
                  <X size={12} color="#737373" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center justify-between px-4 py-1">
        <CaptionText>{isLoading && ketQua.length === 0 ? 'Đang tìm...' : `Tìm thấy ${tongSo} món`}</CaptionText>
        <View className="flex-row gap-2">
          <Chip nhan="Mới nhất" chon={sapXep === 'moi'} khiBam={() => setSapXep('moi')} />
          <Chip nhan="Nhanh nhất" chon={sapXep === 'nhanh'} khiBam={() => setSapXep('nhanh')} />
        </View>
      </View>

      <DanhSachCongThuc
        duLieu={ketQua}
        dangTai={isLoading && ketQua.length === 0}
        dangTaiThem={isFetching && ketQua.length > 0}
        loi={isError ? (error as Error)?.message : null}
        khiLamMoi={() => {
          setTrang(0);
          setTichLuy([]);
          refetch();
        }}
        coTheTaiThem={trang + 1 < tongTrang}
        khiTaiThem={() => setTrang((t) => t + 1)}
        khiChon={(id) => router.push(`/recipe/${id}`)}
        bienThe="grid"
        cot={2}
      />

      <View className="px-4 pb-2">
        <CaptionText canLe="giua">
          Đang xem {ketQua.length} trên tổng số <NumberDisplay value={tongSo} />
        </CaptionText>
      </View>

      <BottomSheet hienThi={moFilter} tieuDe="Bộ lọc tìm kiếm" khiDong={() => setMoFilter(false)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <CaptionText className="mt-4">Kiểu ăn</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {KIEU_AN.map((kieu) => (
              <Chip
                key={kieu}
                nhan={kieu}
                chon={kieuAnChon === kieu}
                khiBam={() => setKieuAnChon((t) => (t === kieu ? null : kieu))}
              />
            ))}
          </View>

          <CaptionText className="mt-5">Thời gian nấu</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {THOI_GIAN.map((nhan, i) => {
              const giaTri = [15, 30, 60, null][i];
              return (
                <Chip
                  key={nhan}
                  nhan={nhan}
                  chon={thoiGianChon === giaTri}
                  khiBam={() => setThoiGianChon(giaTri)}
                />
              );
            })}
          </View>

          <CaptionText className="mt-5">Độ khó</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {DO_KHO.map((doKho) => (
              <Chip
                key={doKho}
                nhan={doKho}
                chon={doKhoChon === doKho}
                khiBam={() => setDoKhoChon((t) => (t === doKho ? null : doKho))}
              />
            ))}
          </View>

          <CaptionText className="mt-5">Khẩu phần phục vụ</CaptionText>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {MOC_KHAU_PHAN.map((muc) => (
              <Chip
                key={muc}
                nhan={`${muc}+ người`}
                chon={khauPhanChon === muc}
                khiBam={() => setKhauPhanChon((t) => (t === muc ? null : muc))}
              />
            ))}
          </View>

          <View className="mt-6 flex-row gap-3 pb-2">
            <NutBam tieuDe="Xóa hết" bienThe="phu" khiBam={xoaHetFilter} className="flex-1" />
            <NutBam
              tieuDe="Áp dụng"
              khiBam={() => setMoFilter(false)}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
