import { Context } from 'telegraf';
import { User as DbUser, Order as DbOrder, Service as DbService } from '@prisma/client';

export enum UserStep {
  SELECT_LANGUAGE = 'SELECT_LANGUAGE',
  ENTER_LAST_NAME = 'ENTER_LAST_NAME',
  ENTER_FIRST_NAME = 'ENTER_FIRST_NAME',
  ENTER_PHONE = 'ENTER_PHONE',
  CONFIRM_PROFILE = 'CONFIRM_PROFILE',
  MAIN_MENU = 'MAIN_MENU',
  SELECT_SERVICE = 'SELECT_SERVICE',
  SELECT_TRANSLATION_DIRECTION = 'SELECT_TRANSLATION_DIRECTION',
  UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENT',
  ENTER_PAGE_COUNT = 'ENTER_PAGE_COUNT',
  CONFIRM_ORDER = 'CONFIRM_ORDER',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  UPLOAD_RECEIPT = 'UPLOAD_RECEIPT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ADMIN_MENU = 'ADMIN_MENU',
  ADMIN_ADD_SERVICE_NAME_UZ = 'ADMIN_ADD_SERVICE_NAME_UZ',
  ADMIN_ADD_SERVICE_NAME_RU = 'ADMIN_ADD_SERVICE_NAME_RU',
  ADMIN_ADD_SERVICE_NAME_EN = 'ADMIN_ADD_SERVICE_NAME_EN',
  ADMIN_ADD_SERVICE_PRICE = 'ADMIN_ADD_SERVICE_PRICE',
  ADMIN_EDIT_SERVICE_NAME = 'ADMIN_EDIT_SERVICE_NAME',
  ADMIN_EDIT_SERVICE_PRICE = 'ADMIN_EDIT_SERVICE_PRICE',
  ADMIN_UPLOAD_RESULT = 'ADMIN_UPLOAD_RESULT',
  ADMIN_BROADCAST = 'ADMIN_BROADCAST',
}

export interface SessionData {
  language?: 'uz' | 'ru' | 'en';
  tempLastName?: string;
  tempFirstName?: string;
  tempPhone?: string;
  selectedServiceId?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  fileId?: string;
  fileName?: string;
  receiptFileId?: string;
  pageCount?: number;
  currentOrderId?: string;
  targetOrderIdForUpload?: string;
  editingServiceId?: string;
}

export interface BotContext extends Context {
  dbUser?: DbUser;
  language: 'uz' | 'ru' | 'en';
}

export interface PaymentResult {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  error?: string;
}

export interface PaymentStatusResult {
  paymentId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  rawStatus?: string;
}
