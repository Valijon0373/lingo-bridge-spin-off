import { PrismaClient } from '@prisma/client';
declare class PrismaService extends PrismaClient {
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
export declare const prisma: PrismaService;
export {};
