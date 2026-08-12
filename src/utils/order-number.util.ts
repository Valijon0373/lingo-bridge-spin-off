export class OrderNumberUtil {
  public static generateOrderNumber(): string {
    const prefix = 'TR';
    const random = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${random}`;
  }
}
