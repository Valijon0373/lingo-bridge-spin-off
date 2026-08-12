export class ValidatorUtil {
  public static isValidPhoneNumber(phone: string): boolean {
    // E.164 pattern or Uzbek phone format: +998901234567 or 998901234567
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?998|998)?[0-9]{9}$/;
    return phoneRegex.test(cleaned);
  }

  public static formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('998')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 9) {
        cleaned = '+998' + cleaned;
      }
    }
    return cleaned;
  }

  public static isValidName(name: string): boolean {
    if (!name || name.trim().length < 2 || name.trim().length > 50) {
      return false;
    }
    return true;
  }

  public static isSupportedFile(fileName?: string, mimeType?: string): boolean {
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      if (allowedExtensions.includes(ext)) {
        return true;
      }
    }

    if (mimeType && allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return true;
    }

    return false;
  }
}
