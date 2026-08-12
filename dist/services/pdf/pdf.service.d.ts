export declare class PdfService {
    static getPdfPageCountFromUrl(fileUrl: string): Promise<number | null>;
    static getPdfPageCountFromBuffer(buffer: Buffer): Promise<number | null>;
}
