import type { FC, ReactNode } from 'react';
import { Text } from 'react-native';

interface VanBanProps {
  children: ReactNode;
  className?: string;
  soDongToiDa?: number;
  dam?: boolean;
}

// BR-UI: Chữ căn trái
export const BodyText: FC<VanBanProps> = ({ children, className = '', soDongToiDa, dam = false }) => (
  <Text
    className={`text-left text-base text-neutral-900 ${dam ? 'font-semibold' : ''} ${className}`}
    numberOfLines={soDongToiDa}
  >
    {children}
  </Text>
);

export const TitleText: FC<VanBanProps> = ({ children, className = '', soDongToiDa }) => (
  <Text
    className={`text-left text-xl font-bold text-neutral-900 ${className}`}
    numberOfLines={soDongToiDa}
  >
    {children}
  </Text>
);

export const CaptionText: FC<VanBanProps> = ({ children, className = '', soDongToiDa }) => (
  <Text className={`text-left text-xs text-neutral-500 ${className}`} numberOfLines={soDongToiDa}>
    {children}
  </Text>
);
