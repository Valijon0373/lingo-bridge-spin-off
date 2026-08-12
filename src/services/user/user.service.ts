import { userRepository } from '../../database/repositories/user.repository';
import { orderRepository } from '../../database/repositories/order.repository';
import { Language, User } from '@prisma/client';
import { SessionData } from '../../types';

export class UserService {
  public async getOrCreateUser(telegramId: number | bigint, username?: string): Promise<User> {
    let user = await userRepository.findByTelegramId(telegramId);
    if (!user) {
      user = await userRepository.createOrUpdate({
        telegramId,
        telegramUsername: username,
        language: Language.UZ,
        step: 'SELECT_LANGUAGE',
      });
    }
    return user;
  }

  public async setLanguage(telegramId: number | bigint, language: Language): Promise<User> {
    return userRepository.createOrUpdate({
      telegramId,
      language,
    });
  }

  public async updateProfile(telegramId: number | bigint, firstName: string, lastName: string, phone: string): Promise<User> {
    return userRepository.createOrUpdate({
      telegramId,
      firstName,
      lastName,
      phone,
    });
  }

  public async updateStep(telegramId: number | bigint, step: string, stepData?: SessionData): Promise<User> {
    return userRepository.updateStep(telegramId, step, stepData);
  }

  public async getUserProfileDetails(userId: string) {
    return orderRepository.getUserStats(userId);
  }
}

export const userService = new UserService();
