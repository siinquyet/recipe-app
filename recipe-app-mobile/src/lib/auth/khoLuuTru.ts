import * as SecureStore from 'expo-secure-store';

export function datMuc(khoa: string, giaTri: string): Promise<void> {
  return SecureStore.setItemAsync(khoa, giaTri);
}

export function layMuc(khoa: string): Promise<string | null> {
  return SecureStore.getItemAsync(khoa);
}

export function xoaMuc(khoa: string): Promise<void> {
  return SecureStore.deleteItemAsync(khoa);
}
