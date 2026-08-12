"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const telegraf_1 = require("telegraf");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const start_handler_1 = require("./handlers/start.handler");
const registration_handler_1 = require("./handlers/registration.handler");
const service_handler_1 = require("./handlers/service.handler");
const order_handler_1 = require("./handlers/order.handler");
const payment_handler_1 = require("./handlers/payment.handler");
const profile_handler_1 = require("./handlers/profile.handler");
const admin_handler_1 = require("./handlers/admin.handler");
function createBot() {
    if (!env_config_1.env.BOT_TOKEN) {
        logger_config_1.logger.error('BOT_TOKEN environment variable is not defined!');
    }
    const bot = new telegraf_1.Telegraf(env_config_1.env.BOT_TOKEN || '123456789:DEFAULT_DUMMY_TOKEN');
    // Register Global Middlewares
    bot.use(error_middleware_1.errorMiddleware);
    bot.use(auth_middleware_1.authMiddleware);
    // Register Handlers
    (0, start_handler_1.registerStartHandler)(bot);
    (0, registration_handler_1.registerRegistrationHandler)(bot);
    (0, service_handler_1.registerServiceHandler)(bot);
    (0, order_handler_1.registerOrderHandler)(bot);
    (0, payment_handler_1.registerPaymentHandler)(bot);
    (0, profile_handler_1.registerProfileHandler)(bot);
    (0, admin_handler_1.registerAdminHandler)(bot);
    return bot;
}
