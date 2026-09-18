import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { ChevronLeft } from 'lucide-react-native';
import { NutBam } from '../../src/components/ui/NutBam';
import { ONhapLieu } from '../../src/components/ui/ONhapLieu';
import { TrangDangTai } from '../../src/components/ui/TrangThai';
import { BodyText, CaptionText, TitleText } from '../../src/components/ui/VanBan';
import { taoCongThucSchema, type TaoCongThucForm } from '../../src/lib/validation/schemas';
import { taiAnhLen } from '../../src/lib/api/uploads';
import { layUrlAnh } from '../../src/lib/utils/anh';
import {
  useCapNhatCongThuc,
  useChiTietCongThuc,
  useTaoCongThuc,
} from '../../src/hooks/useRecipes';

const GIA_TRI_BAN_DAU: TaoCongThucForm = {
  ten: '',
  moTa: '',
  thoiGianNauPhut: 30,
  khauPhan: 2,
  nguyenLieu: [{ ten: '', dinhLuong: 0, donVi: 'g' }],
  cacBuoc: [{ noiDung: '' }],
};

export default function ManHinhTaoCongThuc() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const maSua = Array.isArray(id) ? id[0] : id;
  const cheDoSua = !!maSua;
  const router = useRouter();

  const chiTiet = useChiTietCongThuc(cheDoSua ? (maSua as string) : '');
  const taoMoi = useTaoCongThuc();
  const capNhat = useCapNhatCongThuc(cheDoSua ? (maSua as string) : '');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaoCongThucForm>({
    resolver: zodResolver(taoCongThucSchema),
    defaultValues: GIA_TRI_BAN_DAU,
  });
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [loiAnh, setLoiAnh] = useState<string | null>(null);
  const anhXemTruoc = watch('anhThumbnail') ?? '';

  // BR-UREC: Chọn ảnh từ thư viện → upload binary → lưu URL vào form
  const chonAnh = async () => {
    const ketQua = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (ketQua.canceled || ketQua.assets.length === 0) return;
    setDangTaiAnh(true);
    setLoiAnh(null);
    try {
      const url = await taiAnhLen(ketQua.assets[0].uri);
      setValue('anhThumbnail', url, { shouldValidate: true });
    } catch (e) {
      setLoiAnh(e instanceof Error ? e.message : 'Tải ảnh thất bại');
    } finally {
      setDangTaiAnh(false);
    }
  };

  const dsNguyenLieu = useFieldArray({ control, name: 'nguyenLieu' });
  const dsBuoc = useFieldArray({ control, name: 'cacBuoc' });

  useEffect(() => {
    if (cheDoSua && chiTiet.data) {
      reset({
        ten: chiTiet.data.ten,
        moTa: chiTiet.data.moTa ?? '',
        anhThumbnail: chiTiet.data.anhThumbnail ?? '',
        thoiGianNauPhut: chiTiet.data.thoiGianNauPhut,
        thoiGianChuanBiPhut: chiTiet.data.thoiGianChuanBiPhut ?? undefined,
        khauPhan: chiTiet.data.khauPhan,
        nguyenLieu: chiTiet.data.nguyenLieu.map((nl) => ({
          ten: nl.ten,
          dinhLuong: parseFloat(nl.dinhLuong) || 0,
          donVi: nl.donVi,
        })),
        cacBuoc: chiTiet.data.cacBuoc.map((b) => ({ noiDung: b.noiDung })),
      });
    }
  }, [cheDoSua, chiTiet.data, reset]);

  const guiDi = handleSubmit(async (duLieu) => {
    if (cheDoSua) {
      await capNhat.mutateAsync(duLieu);
    } else {
      await taoMoi.mutateAsync(duLieu);
    }
    router.back();
  });

  if (cheDoSua && chiTiet.isLoading) return <TrangDangTai />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row items-center gap-2">
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.back()} className="-ml-1 p-1">
            <ChevronLeft size={24} color="#1A1A2E" />
          </Pressable>
          <TitleText className="text-2xl">{cheDoSua ? 'Sửa công thức' : 'Tạo công thức'}</TitleText>
        </View>

        <Controller
          control={control}
          name="ten"
          render={({ field: { value, onChange } }) => (
            <ONhapLieu nhan="Tên món *" giaTri={value} khiDoi={onChange} goiY="VD: Phở bò" loi={errors.ten?.message} className="mt-4" />
          )}
        />
        <Controller
          control={control}
          name="moTa"
          render={({ field: { value, onChange } }) => (
            <ONhapLieu nhan="Mô tả" giaTri={value ?? ''} khiDoi={onChange} goiY="Mô tả ngắn..." className="mt-3" />
          )}
        />
        <View className="mt-4">
          <BodyText dam>Ảnh món ăn</BodyText>
          {anhXemTruoc ? (
            <Image
              source={{ uri: layUrlAnh(anhXemTruoc) }}
              style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 8 }}
              contentFit="cover"
            />
          ) : null}
          <NutBam
            tieuDe={anhXemTruoc ? 'Đổi ảnh' : 'Chọn ảnh từ thư viện'}
            bienThe="vien"
            dangTai={dangTaiAnh}
            khiBam={() => void chonAnh()}
            className="mt-2"
          />
          {loiAnh ? (
            <Text className="mt-2 text-left text-sm text-red-600">{loiAnh}</Text>
          ) : (
            <CaptionText>Ảnh JPG/PNG/WebP dưới 5MB</CaptionText>
          )}
        </View>
        <View className="mt-3 flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="thoiGianNauPhut"
              render={({ field: { value, onChange } }) => (
                <ONhapLieu nhan="Nấu (phút) *" giaTri={String(value)} khiDoi={(v) => onChange(parseInt(v, 10) || 0)} banPhim="numeric" loi={errors.thoiGianNauPhut?.message} />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="khauPhan"
              render={({ field: { value, onChange } }) => (
                <ONhapLieu nhan="Khẩu phần *" giaTri={String(value)} khiDoi={(v) => onChange(parseInt(v, 10) || 0)} banPhim="numeric" loi={errors.khauPhan?.message} />
              )}
            />
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <BodyText dam>Nguyên liệu *</BodyText>
          <NutBam tieuDe="+ Thêm" bienThe="mo" khiBam={() => dsNguyenLieu.append({ ten: '', dinhLuong: 0, donVi: 'g' })} className="px-2 py-1" />
        </View>
        {dsNguyenLieu.fields.map((dong, i) => (
          <View key={dong.id} className="mt-2 rounded-xl bg-neutral-100 p-3">
            <Controller
              control={control}
              name={`nguyenLieu.${i}.ten`}
              render={({ field: { value, onChange } }) => (
                <ONhapLieu nhan={`Tên #${i + 1}`} giaTri={value} khiDoi={onChange} loi={errors.nguyenLieu?.[i]?.ten?.message} />
              )}
            />
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1">
                <Controller
                  control={control}
                  name={`nguyenLieu.${i}.dinhLuong`}
                  render={({ field: { value, onChange } }) => (
                    <ONhapLieu nhan="Định lượng" giaTri={String(value)} khiDoi={(v) => onChange(parseFloat(v.replace(',', '.')) || 0)} banPhim="decimal-pad" loi={errors.nguyenLieu?.[i]?.dinhLuong?.message} />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name={`nguyenLieu.${i}.donVi`}
                  render={({ field: { value, onChange } }) => (
                    <ONhapLieu nhan="Đơn vị" giaTri={value} khiDoi={onChange} goiY="g, ml..." />
                  )}
                />
              </View>
            </View>
            {dsNguyenLieu.fields.length > 1 ? (
              <NutBam tieuDe="Xóa" bienThe="mo" khiBam={() => dsNguyenLieu.remove(i)} className="mt-1 self-end px-2 py-1" />
            ) : null}
          </View>
        ))}

        <View className="mt-5 flex-row items-center justify-between">
          <BodyText dam>Các bước *</BodyText>
          <NutBam tieuDe="+ Thêm" bienThe="mo" khiBam={() => dsBuoc.append({ noiDung: '' })} className="px-2 py-1" />
        </View>
        {dsBuoc.fields.map((dong, i) => (
          <View key={dong.id} className="mt-2">
            <Controller
              control={control}
              name={`cacBuoc.${i}.noiDung`}
              render={({ field: { value, onChange } }) => (
                <ONhapLieu nhan={`Bước ${i + 1}`} giaTri={value} khiDoi={onChange} loi={errors.cacBuoc?.[i]?.noiDung?.message} />
              )}
            />
            {dsBuoc.fields.length > 1 ? (
              <NutBam tieuDe="Xóa bước" bienThe="mo" khiBam={() => dsBuoc.remove(i)} className="self-end px-2 py-1" />
            ) : null}
          </View>
        ))}

        {(errors.nguyenLieu?.message ?? errors.cacBuoc?.message) ? (
          <CaptionText className="mt-2 text-red-600">
            {errors.nguyenLieu?.message ?? errors.cacBuoc?.message}
          </CaptionText>
        ) : null}

        <NutBam
          tieuDe={cheDoSua ? 'Lưu thay đổi' : 'Tạo công thức'}
          khiBam={guiDi}
          dangTai={taoMoi.isPending || capNhat.isPending}
          className="mb-8 mt-6"
        />
        <Text className="h-2" />
      </ScrollView>
    </SafeAreaView>
  );
}
