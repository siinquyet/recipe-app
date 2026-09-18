import type { FC, ReactNode } from 'react';

export const TitleText: FC<{ children: ReactNode; className?: string; canLe?: 'trai' | 'giua' }> = ({ children, className = '', canLe = 'trai' }) => (
  <p className={`${canLe === 'giua' ? 'text-center' : 'text-left'} text-2xl font-bold text-primary ${className}`}>{children}</p>
);

export const BodyText: FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-left text-base text-neutral-900 ${className}`}>{children}</p>
);

export const CaptionText: FC<{ children: ReactNode; className?: string; dam?: boolean; canLe?: 'trai' | 'giua' }> = ({
  children,
  className = '',
  dam = false,
  canLe = 'trai',
}) => (
  <p className={`${canLe === 'giua' ? 'text-center' : 'text-left'} text-xs text-muted ${dam ? 'font-bold' : ''} ${className}`}>
    {children}
  </p>
);
