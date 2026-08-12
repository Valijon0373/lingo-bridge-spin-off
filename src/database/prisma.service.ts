import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.config';

class PrismaService extends PrismaClient {
  constructor() {
    super();
  }

  async connect() {
    try {
      await this.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
    }
  }

  async disconnect() {
    await this.$disconnect();
    logger.info('Database disconnected');
  }
}

export const prisma = new PrismaService();
