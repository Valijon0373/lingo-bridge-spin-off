"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const axios_1 = __importDefault(require("axios"));
const logger_config_1 = require("../../config/logger.config");
class PdfService {
    static async getPdfPageCountFromUrl(fileUrl) {
        try {
            const response = await axios_1.default.get(fileUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            const data = await (0, pdf_parse_1.default)(buffer);
            return data.numpages || 1;
        }
        catch (error) {
            logger_config_1.logger.error('Failed to parse PDF page count from URL:', error);
            return null;
        }
    }
    static async getPdfPageCountFromBuffer(buffer) {
        try {
            const data = await (0, pdf_parse_1.default)(buffer);
            return data.numpages || 1;
        }
        catch (error) {
            logger_config_1.logger.error('Failed to parse PDF page count from buffer:', error);
            return null;
        }
    }
}
exports.PdfService = PdfService;
