import pdfParse from 'pdf-parse';
import axios from 'axios';
import { logger } from '../../config/logger.config';

export class PdfService {
  public static async getPdfPageCountFromUrl(fileUrl: string): Promise<number | null> {
    try {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const data = await pdfParse(buffer);
      return data.numpages || 1;
    } catch (error) {
      logger.error('Failed to parse PDF page count from URL:', error);
      return null;
    }
  }

  public static async getPdfPageCountFromBuffer(buffer: Buffer): Promise<number | null> {
    try {
      const data = await pdfParse(buffer);
      return data.numpages || 1;
    } catch (error) {
      logger.error('Failed to parse PDF page count from buffer:', error);
      return null;
    }
  }
}
