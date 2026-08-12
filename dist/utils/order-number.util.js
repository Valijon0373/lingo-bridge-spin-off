"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderNumberUtil = void 0;
class OrderNumberUtil {
    static generateOrderNumber() {
        const prefix = 'TR';
        const random = Math.floor(100000 + Math.random() * 900000);
        return `${prefix}-${random}`;
    }
}
exports.OrderNumberUtil = OrderNumberUtil;
