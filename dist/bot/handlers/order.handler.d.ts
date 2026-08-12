import { Telegraf } from 'telegraf';
import { BotContext, SessionData } from '../../types';
export declare function registerOrderHandler(bot: Telegraf<BotContext>): void;
export declare function createAndShowOrderSummary(ctx: BotContext, sessionData: SessionData): Promise<void>;
