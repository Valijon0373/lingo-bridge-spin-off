import { Payment } from '@prisma/client';
export declare class PaymentRepository {
    create(data: {
        orderId: string;
        provider: string;
        paymentId?: string;
        amount: number;
        currency?: string;
        status?: string;
    }): Promise<Payment>;
    updateStatus(id: string, status: string, paidAt?: Date): Promise<Payment>;
    findByOrderId(orderId: string): Promise<Payment[]>;
}
export declare const paymentRepository: PaymentRepository;
