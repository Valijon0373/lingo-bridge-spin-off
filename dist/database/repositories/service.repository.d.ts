import { Service, PriceType } from '@prisma/client';
export declare class ServiceRepository {
    findAllActive(): Promise<Service[]>;
    findAll(): Promise<Service[]>;
    findById(id: string): Promise<Service | null>;
    create(data: {
        nameUz: string;
        nameRu: string;
        nameEn: string;
        descriptionUz: string;
        descriptionRu: string;
        descriptionEn: string;
        price: number;
        priceType: PriceType;
    }): Promise<Service>;
    updatePrice(id: string, newPrice: number): Promise<Service>;
    updateName(id: string, newName: string): Promise<Service>;
    toggleActive(id: string, isActive: boolean): Promise<Service>;
    delete(id: string): Promise<Service>;
}
export declare const serviceRepository: ServiceRepository;
