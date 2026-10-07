/**
 * Shared package entry point
 * Exports all utilities and types for monorepo consumption
 */

// Number formatting
export * from './number';

// Unit conversion (BR-03, BR-04)
export * from './unit-conversion';

// Types
export * from './types';

// BR-ADM: Tên tiếng Việt cho trạng thái công thức
export * from './trang-thai';

// BR-03: Mốc định lượng + đơn vị dùng chung
export * from './dinh-luong';

// BR-MEAL/BR-SHOP: Ngày YYYY-MM-DD dùng chung
export * from './ngay';

// BR-ANTOAN: Cảnh báo combo nguyên liệu kỵ nhau (offline, 3 nền tảng)
export * from './canh-bao-doc';

// BR-DINHDUONG: Tự ước tính calo khi món thiếu dinh dưỡng
export * from './uoc-tinh-calo';