import { Order, OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma.service';

export class OrderRepository {
  public async create(data: {
    orderNumber: string;
    userId: string;
    serviceId: string;
    sourceLanguage: string;
    targetLanguage: string;
    fileId: string;
    fileName: string;
    pageCount: number;
    unitPrice: number | Prisma.Decimal;
    totalPrice: number | Prisma.Decimal;
  }) {
    return prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        serviceId: data.serviceId,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        fileId: data.fileId,
        fileName: data.fileName,
        pageCount: data.pageCount,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        status: OrderStatus.WAITING_PAYMENT,
      },
      include: {
        service: true,
        user: true,
      },
    });
  }

  public async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        service: true,
        user: true,
      },
    });
  }

  public async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        service: true,
        user: true,
      },
    });
  }

  public async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        service: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status, updatedAt: new Date() },
      include: {
        service: true,
        user: true,
      },
    });
  }

  public async attachResultFile(id: string, resultFileId: string) {
    return prisma.order.update({
      where: { id },
      data: {
        resultFileId,
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
      },
      include: {
        service: true,
        user: true,
      },
    });
  }

  public async countAll(): Promise<number> {
    return prisma.order.count();
  }

  public async countByStatus(status: OrderStatus): Promise<number> {
    return prisma.order.count({ where: { status } });
  }

  public async getTotalRevenue(): Promise<number> {
    const aggregate = await prisma.order.aggregate({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED] },
      },
      _sum: {
        totalPrice: true,
      },
    });

    return Number(aggregate._sum.totalPrice || 0);
  }

  public async getUserStats(userId: string): Promise<{ orderCount: number; totalSpent: number }> {
    const count = await prisma.order.count({ where: { userId } });
    const aggregate = await prisma.order.aggregate({
      where: {
        userId,
        status: { in: [OrderStatus.PAID, OrderStatus.IN_PROGRESS, OrderStatus.COMPLETED] },
      },
      _sum: {
        totalPrice: true,
      },
    });

    return {
      orderCount: count,
      totalSpent: Number(aggregate._sum.totalPrice || 0),
    };
  }

  public async findAllRecent(limit = 20) {
    return prisma.order.findMany({
      take: limit,
      include: {
        service: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findAllForExport() {
    return prisma.order.findMany({
      include: {
        service: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const orderRepository = new OrderRepository();
