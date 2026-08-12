import { PaymentProvider } from './payment.interface';
import { PaymentResult, PaymentStatusResult } from '../../types';
export declare class MockPaymentProvider implements PaymentProvider {
    name: string;
    createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult>;
    verifyPayment(paymentId: string): Promise<PaymentStatusResult>;
}
