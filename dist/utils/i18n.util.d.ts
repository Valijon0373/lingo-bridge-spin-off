declare class I18n {
    private translations;
    constructor();
    private loadTranslations;
    t(lang: string | undefined | null, key: string, params?: Record<string, string | number>): string;
}
export declare const i18n: I18n;
export declare const t: (lang: string | undefined | null, key: string, params?: Record<string, string | number>) => string;
export {};
