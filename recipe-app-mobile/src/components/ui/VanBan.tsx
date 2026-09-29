import type { FC, ReactNode } from 'react';
import { Text } from 'react-native';

interface VanBanProps {
  children: ReactNode;
  className?: string;
  soDongToiDa?: number;
  dam?: boolean;
  canLe?: 'trai' | 'giua';
}

// BR-UI: Chữ căn trái mặc định, canLe giua cho tiêu đề editorial
export const BodyText: FC<VanBanProps> = ({ children, className = '', soDongToiDa, dam = false, canLe = 'trai' }) => (
  <Text
    className={`${canLe === 'giua' ? 'text-center' : 'text-left'} text-base text-neutral-900 ${dam ? 'font-semibold' : ''} ${className}`}
    numberOfLines={soDongToiDa}
  >
    {children}
  </Text>
);

// BR-UI: Tiêu đề serif mực editorial đồng bộ web, chữ thường giữ sans
export const TitleText: FC<VanBanProps> = ({ children, className = '', soDongToiDa, canLe = 'trai' }) => (
  <Text
    className={`${canLe === 'giua' ? 'text-center' : 'text-left'} font-serif text-xl font-bold text-primary ${className}`}
    numberOfLines={soDongToiDa}
  >
    {children}
  </Text>
);

export const CaptionText: FC<VanBanProps> = ({ children, className = '', soDongToiDa, canLe = 'trai' }) => (
  <Text className={`${canLe === 'giua' ? 'text-center' : 'text-left'} text-xs text-neutral-500 ${className}`} numberOfLines={soDongToiDa}>
    {children}
  </Text>
);
