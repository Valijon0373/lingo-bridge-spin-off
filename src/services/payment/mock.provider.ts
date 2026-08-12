import { PaymentProvider } from './payment.interface';
import { PaymentResult, PaymentStatusResult } from '../../types';

export class MockPaymentProvider implements PaymentProvider {
  name = 'MOCK';

  async createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult> {
    const mockPaymentId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const mockUrl = `https://example.com/pay?order=${orderNumber}&amount=${amount}&pid=${mockPaymentId}`;

    return {
      success: true,
      paymentUrl: mockUrl,
      paymentId: mockPaymentId,
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatusResult> {
    return {
      paymentId,
      status: 'PAID',
      rawStatus: 'SUCCESS_MOCK',
    };
  }
}
