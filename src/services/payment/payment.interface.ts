import { PaymentResult, PaymentStatusResult } from '../../types';

export interface PaymentProvider {
  name: string;
  createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult>;
  verifyPayment(paymentId: string): Promise<PaymentStatusResult>;
}
