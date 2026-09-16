import '../global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { chayMigration, layDatabase } from '../src/lib/db/database';
import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/stores/authStore';

SplashScreen.preventAutoHideAsync();

async function daXemOnboardingChua(): Promise<boolean> {
  try {
    const dong = await layDatabase().getFirstAsync<{ giaTri: string }>(
      'SELECT giaTri FROM co_bat_dau WHERE khoa = ?',
      ['onboarding'],
    );
    return dong?.giaTri === '1';
  } catch {
    return false;
  }
}

const DieuHuongBaoVe: FC<{ children: ReactNode }> = ({ children }) => {
  const daKhoiTao = useAuthStore((s) => s.daKhoiTao);
  const daDangNhap = useAuthStore((s) => s.daDangNhap);
  const khoiTao = useAuthStore((s) => s.khoiTao);
  const doan = useSegments();
  const router = useRouter();
  const [daXemOnboarding, setDaXemOnboarding] = useState(true);

  useEffect(() => {
    khoiTao().finally(() => {
      chayMigration()
        .then(() => daXemOnboardingChua())
        .then(setDaXemOnboarding)
        .catch(() => {})
        .finally(() => SplashScreen.hideAsync());
    });
  }, [khoiTao]);

  useEffect(() => {
    if (!daKhoiTao) return;
    const trongNhomAuth = doan[0] === '(auth)';
    if (!daDangNhap && !trongNhomAuth) {
      if (!daXemOnboarding) router.replace('/(auth)/onboarding');
      else router.replace('/(auth)/login');
    } else if (daDangNhap && trongNhomAuth) router.replace('/(tabs)');
  }, [daKhoiTao, daDangNhap, daXemOnboarding, doan, router]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <DieuHuongBaoVe>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="recipe" />
        </Stack>
      </DieuHuongBaoVe>
    </QueryClientProvider>
  );
}
