import { PaymentProvider } from './payment.interface';
import { MockPaymentProvider } from './mock.provider';
import { ClickPaymentProvider } from './click.provider';
import { PaymePaymentProvider } from './payme.provider';
import { paymentRepository } from '../../database/repositories/payment.repository';
import { orderRepository } from '../../database/repositories/order.repository';
import { OrderStatus } from '@prisma/client';
import { env } from '../../config/env.config';
import { logger } from '../../config/logger.config';
import { PaymentResult, PaymentStatusResult } from '../../types';

export class PaymentService {
  private provider: PaymentProvider;

  constructor() {
    this.provider = this.resolveProvider(env.PAYMENT_PROVIDER);
  }

  private resolveProvider(providerName: string): PaymentProvider {
    switch (providerName.toUpperCase()) {
      case 'CLICK':
        return new ClickPaymentProvider();
      case 'PAYME':
        return new PaymePaymentProvider();
      case 'MOCK':
      default:
        return new MockPaymentProvider();
    }
  }

  public setProvider(provider: PaymentProvider) {
    this.provider = provider;
  }

  public async createPayment(orderId: string): Promise<PaymentResult> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // SERVER-SIDE CALCULATED TOTAL AMOUNT - NEVER TRUST USER INPUT
    const amount = Number(order.totalPrice);
    
    const result = await this.provider.createPayment(order.id, order.orderNumber, amount);

    if (result.success) {
      await paymentRepository.create({
        orderId: order.id,
        provider: this.provider.name,
        paymentId: result.paymentId,
        amount,
        status: 'PENDING',
      });
    }

    return result;
  }

  public async verifyAndConfirmPayment(paymentId: string, orderId: string): Promise<boolean> {
    try {
      const verification = await this.provider.verifyPayment(paymentId);
      if (verification.status === 'PAID') {
        // Update order status in DB
        await orderRepository.updateStatus(orderId, OrderStatus.PAID);
        // Also automatically transition to IN_PROGRESS
        await orderRepository.updateStatus(orderId, OrderStatus.IN_PROGRESS);

        const payments = await paymentRepository.findByOrderId(orderId);
        if (payments.length > 0) {
          await paymentRepository.updateStatus(payments[0].id, 'PAID', new Date());
        }
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error verifying payment:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
