import type { SQLiteDatabase } from 'expo-sqlite';

// BR-OFFLINE: Web không có SQLite native — dùng stub in-memory (không persist).
// Metro tự chọn file .web.ts khi bundle cho web nên expo-sqlite không bị import.
const boNhoTam = {
  runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
  getFirstAsync: async () => null,
  getAllAsync: async () => [],
} as unknown as SQLiteDatabase;

export function layDatabase(): SQLiteDatabase {
  return boNhoTam;
}

export function datDatabaseTuyChinh(): void {}

export async function chayMigration(): Promise<void> {}
