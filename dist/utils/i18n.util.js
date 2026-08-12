"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = exports.i18n = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_config_1 = require("../config/logger.config");
class I18n {
    translations = {
        uz: {},
        ru: {},
        en: {},
    };
    constructor() {
        this.loadTranslations();
    }
    loadTranslations() {
        const languages = ['uz', 'ru', 'en'];
        for (const lang of languages) {
            const candidatePaths = [
                path_1.default.resolve(__dirname, `../locales/${lang}/common.json`),
                path_1.default.resolve(process.cwd(), `dist/locales/${lang}/common.json`),
                path_1.default.resolve(process.cwd(), `src/locales/${lang}/common.json`),
            ];
            let loaded = false;
            for (const filePath of candidatePaths) {
                try {
                    if (fs_1.default.existsSync(filePath)) {
                        const content = fs_1.default.readFileSync(filePath, 'utf-8');
                        this.translations[lang] = JSON.parse(content);
                        loaded = true;
                        break;
                    }
                }
                catch (error) {
                    logger_config_1.logger.error(`Error loading translation file at ${filePath} for ${lang}:`, error);
                }
            }
            if (!loaded) {
                logger_config_1.logger.warn(`Translation file not found for ${lang} in candidate paths.`);
            }
        }
    }
    t(lang, key, params) {
        const selectedLang = (lang === 'ru' || lang === 'en') ? lang : 'uz';
        let text = this.translations[selectedLang]?.[key] || this.translations['uz']?.[key] || key;
        if (params) {
            Object.keys(params).forEach((paramKey) => {
                text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
            });
        }
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        return text;
    }
}
exports.i18n = new I18n();
const t = (lang, key, params) => exports.i18n.t(lang, key, params);
exports.t = t;
