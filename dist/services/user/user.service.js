"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_repository_1 = require("../../database/repositories/user.repository");
const order_repository_1 = require("../../database/repositories/order.repository");
const client_1 = require("@prisma/client");
class UserService {
    async getOrCreateUser(telegramId, username) {
        let user = await user_repository_1.userRepository.findByTelegramId(telegramId);
        if (!user) {
            user = await user_repository_1.userRepository.createOrUpdate({
                telegramId,
                telegramUsername: username,
                language: client_1.Language.UZ,
                step: 'SELECT_LANGUAGE',
            });
        }
        return user;
    }
    async setLanguage(telegramId, language) {
        return user_repository_1.userRepository.createOrUpdate({
            telegramId,
            language,
        });
    }
    async updateProfile(telegramId, firstName, lastName, phone) {
        return user_repository_1.userRepository.createOrUpdate({
            telegramId,
            firstName,
            lastName,
            phone,
        });
    }
    async updateStep(telegramId, step, stepData) {
        return user_repository_1.userRepository.updateStep(telegramId, step, stepData);
    }
    async getUserProfileDetails(userId) {
        return order_repository_1.orderRepository.getUserStats(userId);
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
