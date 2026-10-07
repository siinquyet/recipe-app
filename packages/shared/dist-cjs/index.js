"use strict";
/**
 * Shared package entry point
 * Exports all utilities and types for monorepo consumption
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Number formatting
__exportStar(require("./number"), exports);
// Unit conversion (BR-03, BR-04)
__exportStar(require("./unit-conversion"), exports);
// Types
__exportStar(require("./types"), exports);
// BR-ADM: Tên tiếng Việt cho trạng thái công thức
__exportStar(require("./trang-thai"), exports);
// BR-03: Mốc định lượng + đơn vị dùng chung
__exportStar(require("./dinh-luong"), exports);
// BR-MEAL/BR-SHOP: Ngày YYYY-MM-DD dùng chung
__exportStar(require("./ngay"), exports);
// BR-ANTOAN: Cảnh báo combo nguyên liệu kỵ nhau (offline, 3 nền tảng)
__exportStar(require("./canh-bao-doc"), exports);
