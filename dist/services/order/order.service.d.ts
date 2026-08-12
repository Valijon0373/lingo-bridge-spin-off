import { Order, OrderStatus } from '@prisma/client';
export declare class OrderService {
    createOrder(params: {
        userId: string;
        serviceId: string;
        sourceLanguage: string;
        targetLanguage: string;
        fileId: string;
        fileName: string;
        pageCount: number;
    }): Promise<Order>;
    getUserOrders(userId: string): Promise<Order[]>;
    getOrderDetails(orderId: string): Promise<({
        user: {
            id: string;
            telegramId: bigint;
            telegramUsername: string | null;
            language: import(".prisma/client").$Enums.Language;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            step: string;
            stepData: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameUz: string;
            nameRu: string;
            nameEn: string;
            descriptionUz: string;
            descriptionRu: string;
            descriptionEn: string;
            price: import("@prisma/client/runtime/library").Decimal;
            priceType: import(".prisma/client").$Enums.PriceType;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        sourceLanguage: string;
        targetLanguage: string;
        fileId: string;
        fileName: string;
        resultFileId: string | null;
        pageCount: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        serviceId: string;
        userId: string;
    }) | null>;
    updateStatus(orderId: string, status: OrderStatus): Promise<{
        user: {
            id: string;
            telegramId: bigint;
            telegramUsername: string | null;
            language: import(".prisma/client").$Enums.Language;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            step: string;
            stepData: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameUz: string;
            nameRu: string;
            nameEn: string;
            descriptionUz: string;
            descriptionRu: string;
            descriptionEn: string;
            price: import("@prisma/client/runtime/library").Decimal;
            priceType: import(".prisma/client").$Enums.PriceType;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        sourceLanguage: string;
        targetLanguage: string;
        fileId: string;
        fileName: string;
        resultFileId: string | null;
        pageCount: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        serviceId: string;
        userId: string;
    }>;
    attachResult(orderId: string, resultFileId: string): Promise<{
        user: {
            id: string;
            telegramId: bigint;
            telegramUsername: string | null;
            language: import(".prisma/client").$Enums.Language;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            step: string;
            stepData: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            nameUz: string;
            nameRu: string;
            nameEn: string;
            descriptionUz: string;
            descriptionRu: string;
            descriptionEn: string;
            price: import("@prisma/client/runtime/library").Decimal;
            priceType: import(".prisma/client").$Enums.PriceType;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        orderNumber: string;
        sourceLanguage: string;
        targetLanguage: string;
        fileId: string;
        fileName: string;
        resultFileId: string | null;
        pageCount: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        serviceId: string;
        userId: string;
    }>;
}
export declare const orderService: OrderService;
