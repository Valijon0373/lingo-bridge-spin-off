import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../../types';
import { userService } from '../../services/user/user.service';
import { logger } from '../../config/logger.config';

export const authMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  if (!ctx.from) {
    return next();
  }

  try {
    const user = await userService.getOrCreateUser(ctx.from.id, ctx.from.username);
    ctx.dbUser = user;
    ctx.language = (user.language ? user.language.toLowerCase() : 'uz') as 'uz' | 'ru' | 'en';
  } catch (error) {
    logger.error('Error in auth middleware:', error);
    ctx.language = 'uz';
  }

  return next();
};
