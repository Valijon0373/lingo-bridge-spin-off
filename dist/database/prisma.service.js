"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_config_1 = require("../config/logger.config");
class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
    }
    async connect() {
        try {
            await this.$connect();
            logger_config_1.logger.info('✅ Database connected successfully');
        }
        catch (error) {
            logger_config_1.logger.error('❌ Database connection failed:', error);
        }
    }
    async disconnect() {
        await this.$disconnect();
        logger_config_1.logger.info('Database disconnected');
    }
}
exports.prisma = new PrismaService();
