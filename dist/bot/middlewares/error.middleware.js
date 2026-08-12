"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const logger_config_1 = require("../../config/logger.config");
const i18n_util_1 = require("../../utils/i18n.util");
const errorMiddleware = async (ctx, next) => {
    try {
        await next();
    }
    catch (error) {
        logger_config_1.logger.error('Unhandled error in bot update handler:', error);
        try {
            await ctx.reply('⚠️ ' + (0, i18n_util_1.t)(ctx.language, 'invalid_text_input') + ' An unexpected error occurred. Please try again.');
        }
        catch (sendErr) {
            logger_config_1.logger.error('Could not send error response to user:', sendErr);
        }
    }
};
exports.errorMiddleware = errorMiddleware;
