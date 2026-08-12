export declare class ExcelService {
    /**
     * Generates an Excel workbook buffer containing all translation orders.
     */
    generateOrdersExcel(): Promise<Buffer>;
}
export declare const excelService: ExcelService;
