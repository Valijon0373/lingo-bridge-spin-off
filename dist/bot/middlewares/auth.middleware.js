"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const user_service_1 = require("../../services/user/user.service");
const logger_config_1 = require("../../config/logger.config");
const authMiddleware = async (ctx, next) => {
    if (!ctx.from) {
        return next();
    }
    try {
        const user = await user_service_1.userService.getOrCreateUser(ctx.from.id, ctx.from.username);
        ctx.dbUser = user;
        ctx.language = (user.language ? user.language.toLowerCase() : 'uz');
    }
    catch (error) {
        logger_config_1.logger.error('Error in auth middleware:', error);
        ctx.language = 'uz';
    }
    return next();
};
exports.authMiddleware = authMiddleware;
