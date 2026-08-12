import { Telegraf } from 'telegraf';
import { BotContext } from '../../types';
export declare function registerServiceHandler(bot: Telegraf<BotContext>): void;
export declare function showServicesCatalog(ctx: BotContext): Promise<void>;
