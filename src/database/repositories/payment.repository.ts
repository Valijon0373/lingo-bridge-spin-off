import { Payment } from '@prisma/client';
import { prisma } from '../prisma.service';

export class PaymentRepository {
  public async create(data: {
    orderId: string;
    provider: string;
    paymentId?: string;
    amount: number;
    currency?: string;
    status?: string;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        paymentId: data.paymentId,
        amount: data.amount,
        currency: data.currency || 'UZS',
        status: data.status || 'PENDING',
      },
    });
  }

  public async updateStatus(id: string, status: string, paidAt?: Date): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(paidAt ? { paidAt } : {}),
      },
    });
  }

  public async findByOrderId(orderId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const paymentRepository = new PaymentRepository();
