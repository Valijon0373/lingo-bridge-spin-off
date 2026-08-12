"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
class UserRepository {
    async findByTelegramId(telegramId) {
        return prisma_service_1.prisma.user.findUnique({
            where: { telegramId: BigInt(telegramId) },
        });
    }
    async createOrUpdate(data) {
        const bigTelegramId = BigInt(data.telegramId);
        const updateData = {
            telegramUsername: data.telegramUsername,
            updatedAt: new Date(),
        };
        if (data.language)
            updateData.language = data.language;
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.step !== undefined)
            updateData.step = data.step;
        if (data.stepData !== undefined)
            updateData.stepData = data.stepData;
        return prisma_service_1.prisma.user.upsert({
            where: { telegramId: bigTelegramId },
            create: {
                telegramId: bigTelegramId,
                telegramUsername: data.telegramUsername,
                language: data.language || client_1.Language.UZ,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                step: data.step || 'SELECT_LANGUAGE',
                stepData: (data.stepData || {}),
            },
            update: updateData,
        });
    }
    async updateStep(telegramId, step, stepData) {
        const bigTelegramId = BigInt(telegramId);
        return prisma_service_1.prisma.user.update({
            where: { telegramId: bigTelegramId },
            data: {
                step,
                ...(stepData !== undefined ? { stepData: stepData } : {}),
            },
        });
    }
    async countAll() {
        return prisma_service_1.prisma.user.count();
    }
    async findAll() {
        return prisma_service_1.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
