import { Service, PriceType } from '@prisma/client';
import { prisma } from '../prisma.service';

export class ServiceRepository {
  public async findAllActive(): Promise<Service[]> {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findAll(): Promise<Service[]> {
    return prisma.service.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  public async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    });
  }

  public async create(data: {
    nameUz: string;
    nameRu: string;
    nameEn: string;
    descriptionUz: string;
    descriptionRu: string;
    descriptionEn: string;
    price: number;
    priceType: PriceType;
  }): Promise<Service> {
    return prisma.service.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  public async updatePrice(id: string, newPrice: number): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: { price: newPrice },
    });
  }

  public async updateName(id: string, newName: string): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: {
        nameUz: newName,
        nameRu: newName,
        nameEn: newName,
      },
    });
  }

  public async toggleActive(id: string, isActive: boolean): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: { isActive },
    });
  }

  public async delete(id: string): Promise<Service> {
    return prisma.service.delete({
      where: { id },
    });
  }
}

export const serviceRepository = new ServiceRepository();
