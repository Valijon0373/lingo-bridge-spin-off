"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRepository = exports.ServiceRepository = void 0;
const prisma_service_1 = require("../prisma.service");
class ServiceRepository {
    async findAllActive() {
        return prisma_service_1.prisma.service.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findAll() {
        return prisma_service_1.prisma.service.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }
    async findById(id) {
        return prisma_service_1.prisma.service.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma_service_1.prisma.service.create({
            data: {
                ...data,
                isActive: true,
            },
        });
    }
    async updatePrice(id, newPrice) {
        return prisma_service_1.prisma.service.update({
            where: { id },
            data: { price: newPrice },
        });
    }
    async updateName(id, newName) {
        return prisma_service_1.prisma.service.update({
            where: { id },
            data: {
                nameUz: newName,
                nameRu: newName,
                nameEn: newName,
            },
        });
    }
    async toggleActive(id, isActive) {
        return prisma_service_1.prisma.service.update({
            where: { id },
            data: { isActive },
        });
    }
    async delete(id) {
        return prisma_service_1.prisma.service.delete({
            where: { id },
        });
    }
}
exports.ServiceRepository = ServiceRepository;
exports.serviceRepository = new ServiceRepository();
