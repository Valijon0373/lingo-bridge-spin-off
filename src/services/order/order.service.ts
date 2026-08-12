import { orderRepository } from '../../database/repositories/order.repository';
import { serviceRepository } from '../../database/repositories/service.repository';
import { OrderNumberUtil } from '../../utils/order-number.util';
import { Order, OrderStatus, PriceType } from '@prisma/client';

export class OrderService {
  public async createOrder(params: {
    userId: string;
    serviceId: string;
    sourceLanguage: string;
    targetLanguage: string;
    fileId: string;
    fileName: string;
    pageCount: number;
  }): Promise<Order> {
    const service = await serviceRepository.findById(params.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // SERVER SIDE PRICE COMPUTATION
    const unitPrice = Number(service.price);
    const pages = service.priceType === PriceType.FIXED ? 1 : Math.max(1, params.pageCount);
    const totalPrice = unitPrice * pages;
    const orderNumber = OrderNumberUtil.generateOrderNumber();

    return orderRepository.create({
      orderNumber,
      userId: params.userId,
      serviceId: params.serviceId,
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
      fileId: params.fileId,
      fileName: params.fileName,
      pageCount: pages,
      unitPrice,
      totalPrice,
    });
  }

  public async getUserOrders(userId: string): Promise<Order[]> {
    return orderRepository.findByUserId(userId);
  }

  public async getOrderDetails(orderId: string) {
    return orderRepository.findById(orderId);
  }

  public async updateStatus(orderId: string, status: OrderStatus) {
    return orderRepository.updateStatus(orderId, status);
  }

  public async attachResult(orderId: string, resultFileId: string) {
    return orderRepository.attachResultFile(orderId, resultFileId);
  }
}

export const orderService = new OrderService();
