import { fromPath } from 'pdf2pic';
import fs from 'fs/promises';
import path from 'path';

export class PdfService {
  /**
   * Convert PDF to base64-encoded images
   * @param pdfPath Path to the PDF file
   * @returns Array of base64-encoded images
   */
  async convertPdfToImages(pdfPath: string): Promise<string[]> {
    try {
      const images: string[] = [];

      // Configure pdf2pic
      const options = {
        density: 200,           // DPI
        saveFilename: 'temp',
        savePath: '/tmp',
        format: 'png',
        width: 2000,
        height: 2000,
      };

      const convert = fromPath(pdfPath, options);

      // Get page count first
      const pageCount = await this.getPageCount(pdfPath);

      // Convert each page
      for (let page = 1; page <= pageCount; page++) {
        const result = await convert(page, { responseType: 'base64' });
        if (result.base64) {
          images.push(result.base64);
        }
      }

      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate PDF file
   * @param filePath Path to the file
   * @returns True if valid PDF
   */
  async validatePdf(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      // Check PDF magic number
      return buffer.toString('utf8', 0, 4) === '%PDF';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get PDF page count
   * @param pdfPath Path to the PDF file
   * @returns Number of pages
   */
  async getPageCount(pdfPath: string): Promise<number> {
    try {
      const buffer = await fs.readFile(pdfPath);
      const pdfContent = buffer.toString('binary');

      // Count /Type /Page occurrences (simple method)
      const matches = pdfContent.match(/\/Type[\s]*\/Page[^s]/g);
      return matches ? matches.length : 1;
    } catch (error) {
      console.error('Error getting page count:', error);
      // Default to 1 page if we can't determine
      return 1;
    }
  }
}
