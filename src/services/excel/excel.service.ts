import Workbook from 'exceljs';
import { orderRepository } from '../../database/repositories/order.repository';
import { OrderStatus } from '@prisma/client';

export class ExcelService {
  /**
   * Generates an Excel workbook buffer containing all translation orders.
   */
  public async generateOrdersExcel(): Promise<Buffer> {
    const orders = await orderRepository.findAllForExport();

    const workbook = new Workbook.Workbook();
    const worksheet = workbook.addWorksheet('Buyurtmalar', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Define Columns
    worksheet.columns = [
      { header: '№', key: 'orderNumber', width: 15 },
      { header: 'Mijoz (F.I.Sh)', key: 'userName', width: 25 },
      { header: 'Telefon', key: 'phone', width: 18 },
      { header: 'Telegram ID', key: 'telegramId', width: 16 },
      { header: 'Xizmat', key: 'serviceName', width: 25 },
      { header: 'Yo‘nalish', key: 'direction', width: 16 },
      { header: 'Fayl nomi', key: 'fileName', width: 22 },
      { header: 'Sahifa', key: 'pageCount', width: 10 },
      { header: 'Birlik narxi (so‘m)', key: 'unitPrice', width: 20 },
      { header: 'Jami summa (so‘m)', key: 'totalPrice', width: 20 },
      { header: 'Holati', key: 'status', width: 18 },
      { header: 'Sana', key: 'createdAt', width: 20 },
    ];

    // Format Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }, // Dark Blue
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    const statusTranslations: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '🟡 Kutilmoqda',
      [OrderStatus.WAITING_PAYMENT]: '⏳ To‘lov kutilmoqda',
      [OrderStatus.PAID]: '🟢 To‘langan',
      [OrderStatus.IN_PROGRESS]: '🔵 Jarayonda',
      [OrderStatus.COMPLETED]: '✅ Tugallangan',
      [OrderStatus.CANCELLED]: '❌ Bekor qilingan',
      [OrderStatus.REFUNDED]: '↩️ Qaytarilgan',
    };

    // Populate Rows
    orders.forEach((order, index) => {
      const user = order.user;
      const userName = `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Nodavlat';
      const phone = user?.phone || '-';
      const telegramId = user?.telegramId ? String(user.telegramId) : '-';
      const serviceName = order.service?.nameUz || '-';
      const direction = `${order.sourceLanguage} → ${order.targetLanguage}`;
      const statusText = statusTranslations[order.status] || order.status;

      const createdDate = new Date(order.createdAt);
      const formattedDate = createdDate.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const row = worksheet.addRow({
        orderNumber: `#${order.orderNumber}`,
        userName,
        phone,
        telegramId,
        serviceName,
        direction,
        fileName: order.fileName,
        pageCount: order.pageCount,
        unitPrice: Number(order.unitPrice),
        totalPrice: Number(order.totalPrice),
        status: statusText,
        createdAt: formattedDate,
      });

      // Alignments & Number Formats
      row.getCell('orderNumber').alignment = { horizontal: 'center' };
      row.getCell('phone').alignment = { horizontal: 'center' };
      row.getCell('telegramId').alignment = { horizontal: 'center' };
      row.getCell('direction').alignment = { horizontal: 'center' };
      row.getCell('pageCount').alignment = { horizontal: 'center' };
      row.getCell('status').alignment = { horizontal: 'center' };
      row.getCell('createdAt').alignment = { horizontal: 'center' };

      row.getCell('unitPrice').numFmt = '#,##0';
      row.getCell('totalPrice').numFmt = '#,##0';

      // Alternate row background colors (zebra striping)
      if (index % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F2F4F7' },
          };
        });
      }
    });

    // Auto-fit column widths based on maximum length in each column
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const strVal = cell.value ? String(cell.value) : '';
        if (strVal.length > maxLen) {
          maxLen = strVal.length;
        }
      });
      column.width = Math.max(column.width || 12, maxLen + 4);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const excelService = new ExcelService();
