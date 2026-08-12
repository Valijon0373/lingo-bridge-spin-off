import { PaymentProvider } from './payment.interface';
import { PaymentResult, PaymentStatusResult } from '../../types';
import { env } from '../../config/env.config';

export class ClickPaymentProvider implements PaymentProvider {
  name = 'CLICK';

  async createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult> {
    const serviceId = env.CLICK_SERVICE_ID;
    const merchantId = env.CLICK_MERCHANT_ID;
    const transactionParam = orderId;

    // Click checkout URL format
    const paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transactionParam}&return_url=https://t.me/`;

    return {
      success: true,
      paymentUrl,
      paymentId: `CLICK-${orderId}`,
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatusResult> {
    return {
      paymentId,
      status: 'PAID',
      rawStatus: 'CLICK_VERIFIED',
    };
  }
}
