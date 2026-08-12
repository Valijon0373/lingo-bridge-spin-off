import { User, Language, Prisma } from '@prisma/client';
import { prisma } from '../prisma.service';
import { SessionData } from '../../types';

export class UserRepository {
  public async findByTelegramId(telegramId: number | bigint): Promise<User | null> {
    return prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
  }

  public async createOrUpdate(data: {
    telegramId: number | bigint;
    telegramUsername?: string;
    language?: Language;
    firstName?: string;
    lastName?: string;
    phone?: string;
    step?: string;
    stepData?: SessionData;
  }): Promise<User> {
    const bigTelegramId = BigInt(data.telegramId);

    const updateData: Prisma.UserUpdateInput = {
      telegramUsername: data.telegramUsername,
      updatedAt: new Date(),
    };

    if (data.language) updateData.language = data.language;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.step !== undefined) updateData.step = data.step;
    if (data.stepData !== undefined) updateData.stepData = data.stepData as unknown as Prisma.InputJsonValue;

    return prisma.user.upsert({
      where: { telegramId: bigTelegramId },
      create: {
        telegramId: bigTelegramId,
        telegramUsername: data.telegramUsername,
        language: data.language || Language.UZ,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        step: data.step || 'SELECT_LANGUAGE',
        stepData: (data.stepData || {}) as unknown as Prisma.InputJsonValue,
      },
      update: updateData,
    });
  }

  public async updateStep(telegramId: number | bigint, step: string, stepData?: SessionData): Promise<User> {
    const bigTelegramId = BigInt(telegramId);
    return prisma.user.update({
      where: { telegramId: bigTelegramId },
      data: {
        step,
        ...(stepData !== undefined ? { stepData: stepData as unknown as Prisma.InputJsonValue } : {}),
      },
    });
  }

  public async countAll(): Promise<number> {
    return prisma.user.count();
  }

  public async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
