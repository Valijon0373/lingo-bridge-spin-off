import { PaymentProvider } from './payment.interface';
import { PaymentResult } from '../../types';
export declare class PaymentService {
    private provider;
    constructor();
    private resolveProvider;
    setProvider(provider: PaymentProvider): void;
    createPayment(orderId: string): Promise<PaymentResult>;
    verifyAndConfirmPayment(paymentId: string, orderId: string): Promise<boolean>;
}
export declare const paymentService: PaymentService;
