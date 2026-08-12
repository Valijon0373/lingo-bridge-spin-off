import { PaymentProvider } from './payment.interface';
import { PaymentResult, PaymentStatusResult } from '../../types';
import { env } from '../../config/env.config';

export class PaymePaymentProvider implements PaymentProvider {
  name = 'PAYME';

  async createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult> {
    const merchantId = env.PAYME_MERCHANT_ID;
    const amountInTiyin = amount * 100;
    
    // Payme base64 encoded params format: m={merchant_id};ac.order_id={order_id};a={amount_in_tiyin}
    const params = `m=${merchantId};ac.order_id=${orderId};a=${amountInTiyin}`;
    const base64Params = Buffer.from(params).toString('base64');
    const paymentUrl = `https://checkout.paycom.uz/${base64Params}`;

    return {
      success: true,
      paymentUrl,
      paymentId: `PAYME-${orderId}`,
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatusResult> {
    return {
      paymentId,
      status: 'PAID',
      rawStatus: 'PAYME_VERIFIED',
    };
  }
}
