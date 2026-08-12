import { User, Language } from '@prisma/client';
import { SessionData } from '../../types';
export declare class UserRepository {
    findByTelegramId(telegramId: number | bigint): Promise<User | null>;
    createOrUpdate(data: {
        telegramId: number | bigint;
        telegramUsername?: string;
        language?: Language;
        firstName?: string;
        lastName?: string;
        phone?: string;
        step?: string;
        stepData?: SessionData;
    }): Promise<User>;
    updateStep(telegramId: number | bigint, step: string, stepData?: SessionData): Promise<User>;
    countAll(): Promise<number>;
    findAll(): Promise<User[]>;
}
export declare const userRepository: UserRepository;
