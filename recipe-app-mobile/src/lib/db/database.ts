import * as SQLite from 'expo-sqlite';

const TEN_CSDL = 'cook.db';

let instance: SQLite.SQLiteDatabase | null = null;

export function layDatabase(): SQLite.SQLiteDatabase {
  if (!instance) instance = SQLite.openDatabaseSync(TEN_CSDL);
  return instance;
}

export function datDatabaseTuyChinh(db: SQLite.SQLiteDatabase | null): void {
  instance = db;
}

// BR-OFFLINE: Cache công thức + lịch sử tìm kiếm cho chế độ offline
export async function chayMigration(db: SQLite.SQLiteDatabase = layDatabase()): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cong_thuc_cache (
      id TEXT PRIMARY KEY NOT NULL,
      ten TEXT NOT NULL,
      anhThumbnail TEXT,
      thoiGianNauPhut INTEGER NOT NULL DEFAULT 0,
      khauPhan INTEGER NOT NULL DEFAULT 1,
      tacGiaTen TEXT NOT NULL DEFAULT '',
      duLieuJson TEXT NOT NULL,
      dongBoLuc TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cong_thuc_cache_ten ON cong_thuc_cache(ten);
    CREATE TABLE IF NOT EXISTS lich_su_tim_kiem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tuKhoa TEXT NOT NULL,
      taoLuc TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS co_bat_dau (
      khoa TEXT PRIMARY KEY NOT NULL,
      giaTri TEXT NOT NULL
    );
  `);
}
