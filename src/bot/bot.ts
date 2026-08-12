import { Telegraf } from 'telegraf';
import { BotContext } from '../types';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';

import { authMiddleware } from './middlewares/auth.middleware';
import { errorMiddleware } from './middlewares/error.middleware';

import { registerStartHandler } from './handlers/start.handler';
import { registerRegistrationHandler } from './handlers/registration.handler';
import { registerServiceHandler } from './handlers/service.handler';
import { registerOrderHandler } from './handlers/order.handler';
import { registerPaymentHandler } from './handlers/payment.handler';
import { registerProfileHandler } from './handlers/profile.handler';
import { registerAdminHandler } from './handlers/admin.handler';

export function createBot(): Telegraf<BotContext> {
  if (!env.BOT_TOKEN) {
    logger.error('BOT_TOKEN environment variable is not defined!');
  }

  const bot = new Telegraf<BotContext>(env.BOT_TOKEN || '123456789:DEFAULT_DUMMY_TOKEN');

  // Register Global Middlewares
  bot.use(errorMiddleware);
  bot.use(authMiddleware);

  // Register Handlers
  registerStartHandler(bot);
  registerRegistrationHandler(bot);
  registerServiceHandler(bot);
  registerOrderHandler(bot);
  registerPaymentHandler(bot);
  registerProfileHandler(bot);
  registerAdminHandler(bot);

  return bot;
}
