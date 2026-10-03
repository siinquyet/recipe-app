import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Chip } from '../../src/components/ui/Chip';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai, TrangLoi, TrangTrong } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { NumberDisplay } from '../../src/components/ui/NumberDisplay';
import { capNhatTrangThaiMon } from '../../src/lib/api/shoppingLists';
import { khoaTruyVan } from '../../src/lib/queryClient';
import {
  useCapNhatDanhSachDiCho,
  useChiTietDanhSachDiCho,
  useChuyenTrangThaiMon,
  useDanhSachDiCho,
  useSuaMonDiCho,
  useTaoDanhSachDiCho,
  useThemMonDiCho,
  useXoaDanhSachDiCho,
  useXoaMonDiCho,
} from '../../src/hooks/useMealShopping';

// BR-SHOP: Chi tiết y web DiCho — tiến trình, checkbox tròn
function ChiTietDiCho({ id }: { id: string }) {
  const { data, isLoading, isError } = useChiTietDanhSachDiCho(id);
  const chuyenTrangThai = useChuyenTrangThaiMon(id);
  const themMon = useThemMonDiCho(id);
  const suaMon = useSuaMonDiCho(id);
  const xoaMon = useXoaMonDiCho(id);
  const queryClient = useQueryClient();
  const [dangMuaHet, setDangMuaHet] = useState(false);
  const [dangThem, setDangThem] = useState(false);
  const [tenMoi, setTenMoi] = useState('');
  const [luongMoi, setLuongMoi] = useState('');
  const [donViMoi, setDonViMoi] = useState('g');
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [suaTen, setSuaTen] = useState('');
  const [suaLuong, setSuaLuong] = useState('');
  const [suaDonVi, setSuaDonVi] = useState('');

  // BR-SHOP: Mua/bỏ hết 1 chạm — gom N request rồi tải lại 1 lần
  const doiHet = async (daChon: boolean) => {
    if (!data || dangMuaHet) return;
    setDangMuaHet(true);
    try {
      await Promise.all(
        data.cacMon
          .filter((mon) => mon.daChon !== daChon)
          .map((mon) => capNhatTrangThaiMon(id, mon.id, daChon)),
      );
      await queryClient.invalidateQueries({ queryKey: khoaTruyVan.danhSachDiCho.chiTiet(id) });
    } finally {
      setDangMuaHet(false);
    }
  };

  if (isLoading) return <TrangDangTai />;
  if (isError || !data) return <TrangLoi loi="Không tải được chi tiết" />;

  const soDaMua = data.cacMon.filter((mon) => mon.daChon).length;
  const tyLe = data.cacMon.length === 0 ? 0 : Math.round((soDaMua / data.cacMon.length) * 100);

  // BR-SHOP: Thêm món thủ công — chặn tên trống phía client
  const luuMonMoi = () => {
    if (!tenMoi.trim()) return;
    themMon.mutate(
      { tenGoc: tenMoi.trim(), dinhLuong: parseFloat(luongMoi.replace(',', '.')) || 0, donVi: donViMoi.trim() || 'g' },
      { onSuccess: () => { setTenMoi(''); setLuongMoi(''); setDonViMoi('g'); setDangThem(false); } },
    );
  };

  const batDauSua = (monId: string, ten: string, luong: string, donVi: string) => {
    setDangSuaId(monId);
    setSuaTen(ten);
    setSuaLuong(luong);
    setSuaDonVi(donVi);
  };

  const luuSua = (monId: string) => {
    if (!suaTen.trim()) return;
    suaMon.mutate(
      {
        itemId: monId,
        payload: {
          tenGoc: suaTen.trim(),
          dinhLuong: parseFloat(suaLuong.replace(',', '.')) || 0,
          donVi: suaDonVi.trim() || 'g',
        },
      },
      { onSuccess: () => setDangSuaId(null) },
    );
  };

  return (
    <View>
      <View className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="font-serif text-xl font-bold text-primary">{data.ten}</Text>
          <CaptionText>
            Đã mua <NumberDisplay value={soDaMua} />/<NumberDisplay value={data.cacMon.length} /> món ({tyLe}%)
          </CaptionText>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
          <View className="h-full rounded-full bg-deepteal" style={{ width: `${tyLe}%` }} />
        </View>
        <View className="mt-2 flex-row justify-end gap-2">
          <Pressable accessibilityRole="button" onPress={() => void doiHet(true)} disabled={dangMuaHet}>
            <Text className="text-xs font-semibold text-deepteal">Mua hết</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void doiHet(false)} disabled={dangMuaHet}>
            <Text className="text-xs font-semibold text-neutral-500">Bỏ hết</Text>
          </Pressable>
        </View>
        <View className="mt-2">
          {data.cacMon.map((mon) => (
            <View key={mon.id} className="border-b border-neutral-100 py-3">
              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityRole="checkbox"
                  onPress={() => chuyenTrangThai.mutate({ itemId: mon.id, daChon: !mon.daChon })}
                  className="flex-row flex-1 items-center gap-3"
                >
                  <View
                    className={`h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                      mon.daChon ? 'border-deepteal bg-deepteal' : 'border-neutral-300'
                    }`}
                  >
                    {mon.daChon ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                  </View>
                  <BodyText
                    soDongToiDa={1}
                    className={`flex-1 ${mon.daChon ? 'text-neutral-400 line-through' : ''}`}
                  >
                    {mon.tenGoc}
                  </BodyText>
                  <NumberDisplay value={mon.dinhLuong} unit={mon.donVi} className="text-sm" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => (dangSuaId === mon.id ? setDangSuaId(null) : batDauSua(mon.id, mon.tenGoc, mon.dinhLuong, mon.donVi))}
                >
                  <Text className="text-xs font-semibold text-deepteal">Sửa</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={xoaMon.isPending}
                  onPress={() => xoaMon.mutate(mon.id)}
                  className={xoaMon.isPending ? 'opacity-50' : undefined}
                >
                  <Text className="text-xs font-semibold text-red-500">Xóa</Text>
                </Pressable>
              </View>
              {dangSuaId === mon.id ? (
                <View className="mt-2 rounded-xl bg-mist p-3">
                  <ONhapLieu nhan="Tên món" giaTri={suaTen} khiDoi={setSuaTen} />
                  <View className="mt-2 flex-row gap-2">
                    <View className="flex-1">
                      <ONhapLieu nhan="Định lượng" giaTri={suaLuong} khiDoi={setSuaLuong} banPhim="decimal-pad" />
                    </View>
                    <View className="flex-1">
                      <ONhapLieu nhan="Đơn vị" giaTri={suaDonVi} khiDoi={setSuaDonVi} goiY="g, ml..." />
                    </View>
                  </View>
                  <NutBam tieuDe="Lưu" dangTai={suaMon.isPending} khiBam={() => luuSua(mon.id)} className="mt-2" />
                </View>
              ) : null}
            </View>
          ))}
        </View>
        <NutBam
          tieuDe={dangThem ? 'Hủy' : '+ Thêm món'}
          bienThe="vien"
          khiBam={() => setDangThem((v) => !v)}
          className="mt-3"
        />
        {dangThem ? (
          <View className="mt-2 rounded-xl bg-mist p-3">
            <ONhapLieu nhan="Tên món *" giaTri={tenMoi} khiDoi={setTenMoi} goiY="VD: Rau muống" />
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1">
                <ONhapLieu nhan="Định lượng" giaTri={luongMoi} khiDoi={setLuongMoi} banPhim="decimal-pad" goiY="0" />
              </View>
              <View className="flex-1">
                <ONhapLieu nhan="Đơn vị" giaTri={donViMoi} khiDoi={setDonViMoi} goiY="g, ml..." />
              </View>
            </View>
            <NutBam
              tieuDe="Thêm vào danh sách"
              dangTai={themMon.isPending}
              voHieuHoa={!tenMoi.trim()}
              khiBam={luuMonMoi}
              className="mt-2"
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ManHinhDiCho() {
  const router = useRouter();
  // BR-SHOP: Đi chợ là dữ liệu riêng từng tài khoản — chưa đăng nhập thì mời đăng nhập
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const { data, isLoading, isError, refetch } = useDanhSachDiCho();
  const taoMoi = useTaoDanhSachDiCho();
  const xoaDanhSach = useXoaDanhSachDiCho();
  const capNhatDanhSach = useCapNhatDanhSachDiCho();
  const [danhSachChon, setDanhSachChon] = useState<string | null>(null);
  const [dangTao, setDangTao] = useState(false);
  const [ten, setTen] = useState('');
  const [loiTao, setLoiTao] = useState('');

  const dsId = danhSachChon ?? data?.noiDung[0]?.id ?? null;
  const dsChon = data?.noiDung.find((ds) => ds.id === dsId);

  // BR-SHOP: Chặn tên trống phía client để đỡ tốn 1 request 400
  const luuDanhSachMoi = () => {
    if (!ten.trim()) {
      setLoiTao('Vui lòng nhập tên danh sách');
      return;
    }
    setLoiTao('');
    taoMoi.mutate(
      { ten: ten.trim(), loaiNguon: 'MANUAL' },
      { onSuccess: () => { setTen(''); setDangTao(false); } },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-mist">
      {!nguoiDung ? (
        <View className="flex-1 items-center justify-center px-6">
          <TitleText canLe="giua" className="text-2xl">Danh sách đi chợ</TitleText>
          <CaptionText canLe="giua" className="mt-2">Đăng nhập để xem danh sách đi chợ của riêng bạn</CaptionText>
          <NutBam tieuDe="Đăng nhập" khiBam={() => router.push('/(auth)/login')} className="mt-4 px-8" />
        </View>
      ) : (
      <ScrollView className="flex-1 px-4 pt-4">
        <CaptionText className="font-bold uppercase tracking-widest text-deepteal">
          Tiện ích gian bếp gia đình
        </CaptionText>
        <View className="mt-1 flex-row items-center justify-between">
          <TitleText className="flex-1 text-2xl">Danh Sách Đi Chợ Gia Đình</TitleText>
          <NutBam tieuDe={dangTao ? 'Hủy' : '+ Mới'} bienThe="mo" khiBam={() => { setDangTao((v) => !v); setLoiTao(''); }} />
        </View>

        {(data?.noiDung.length ?? 0) > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {(data?.noiDung ?? []).map((ds) => (
                <Chip
                  key={ds.id}
                  nhan={ds.ten}
                  chon={dsId === ds.id}
                  khiBam={() => setDanhSachChon(ds.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : null}

        {dangTao ? (
          <View className="mt-3 rounded-3xl bg-white p-4 shadow-sm">
            <ONhapLieu nhan="Tên danh sách" giaTri={ten} khiDoi={(giaTri) => { setTen(giaTri); if (loiTao) setLoiTao(''); }} goiY="VD: Đi chợ cuối tuần" />
            {loiTao ? <CaptionText className="mt-1 text-red-500">{loiTao}</CaptionText> : null}
            {taoMoi.isError ? <CaptionText className="mt-1 text-red-500">Không tạo được, thử lại sau</CaptionText> : null}
            <NutBam
              tieuDe="Tạo danh sách"
              dangTai={taoMoi.isPending}
              voHieuHoa={!ten.trim()}
              khiBam={luuDanhSachMoi}
              className="mt-4"
            />
          </View>
        ) : null}

        <View className="mt-2 pb-6">
          {isLoading ? (
            <TrangDangTai />
          ) : isError ? (
            <TrangLoi loi="Không tải được danh sách" khiThuLai={() => refetch()} />
          ) : !dsId ? (
            <TrangTrong tieuDe="Chưa có danh sách" moTa="Tạo từ kế hoạch ăn hoặc tạo thủ công" />
          ) : (
            <View>
              <ChiTietDiCho id={dsId} />
              <View className="mt-3 flex-row justify-end gap-2">
                {dsChon?.trangThai !== 'COMPLETED' ? (
                  <NutBam
                    tieuDe="Hoàn thành"
                    bienThe="vien"
                    dangTai={capNhatDanhSach.isPending}
                    khiBam={() => capNhatDanhSach.mutate({ id: dsId, payload: { trangThai: 'COMPLETED' } })}
                    className="px-4 py-2"
                  />
                ) : null}
                <NutBam
                  tieuDe="Xóa"
                  bienThe="mo"
                  dangTai={xoaDanhSach.isPending}
                  khiBam={() => xoaDanhSach.mutate(dsId, { onSuccess: () => setDanhSachChon(null) })}
                  className="px-4 py-2"
                />
              </View>
              {xoaDanhSach.isError ? <CaptionText className="mt-1 text-red-500">Không xóa được, thử lại sau</CaptionText> : null}
            </View>
          )}
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
