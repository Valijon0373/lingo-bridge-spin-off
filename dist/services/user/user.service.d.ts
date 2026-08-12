import { Language, User } from '@prisma/client';
import { SessionData } from '../../types';
export declare class UserService {
    getOrCreateUser(telegramId: number | bigint, username?: string): Promise<User>;
    setLanguage(telegramId: number | bigint, language: Language): Promise<User>;
    updateProfile(telegramId: number | bigint, firstName: string, lastName: string, phone: string): Promise<User>;
    updateStep(telegramId: number | bigint, step: string, stepData?: SessionData): Promise<User>;
    getUserProfileDetails(userId: string): Promise<{
        orderCount: number;
        totalSpent: number;
    }>;
}
export declare const userService: UserService;
