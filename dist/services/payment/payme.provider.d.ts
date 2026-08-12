import { PaymentProvider } from './payment.interface';
import { PaymentResult, PaymentStatusResult } from '../../types';
export declare class PaymePaymentProvider implements PaymentProvider {
    name: string;
    createPayment(orderId: string, orderNumber: string, amount: number): Promise<PaymentResult>;
    verifyPayment(paymentId: string): Promise<PaymentStatusResult>;
}
