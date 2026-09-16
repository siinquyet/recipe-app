import type { FC } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type BienTheNut = 'chinh' | 'phu' | 'vien' | 'mo';

interface NutBamProps {
  tieuDe: string;
  khiBam?: () => void;
  bienThe?: BienTheNut;
  voHieuHoa?: boolean;
  dangTai?: boolean;
  className?: string;
}

const MAU_NEN: Record<BienTheNut, string> = {
  chinh: 'bg-primary',
  phu: 'bg-neutral-200',
  vien: 'bg-transparent border border-primary',
  mo: 'bg-transparent',
};

const MAU_CHU: Record<BienTheNut, string> = {
  chinh: 'text-white',
  phu: 'text-neutral-900',
  vien: 'text-primary',
  mo: 'text-primary',
};

export const NutBam: FC<NutBamProps> = ({
  tieuDe,
  khiBam,
  bienThe = 'chinh',
  voHieuHoa = false,
  dangTai = false,
  className = '',
}) => {
  const tat = voHieuHoa || dangTai;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={tat}
      onPress={khiBam}
      className={`items-center justify-center rounded-xl px-4 py-3 ${MAU_NEN[bienThe]} ${
        tat ? 'opacity-50' : ''
      } ${className}`}
    >
      {dangTai ? (
        <ActivityIndicator color={bienThe === 'chinh' ? '#fff' : '#0A2533'} />
      ) : (
        <Text className={`text-base font-semibold ${MAU_CHU[bienThe]}`}>{tieuDe}</Text>
      )}
    </Pressable>
  );
};
