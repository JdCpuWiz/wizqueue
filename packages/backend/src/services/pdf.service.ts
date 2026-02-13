import { pdf } from 'pdf-to-img';
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
      const document = await pdf(pdfPath, { scale: 2.0 });

      for await (const image of document) {
        // Convert buffer to base64
        const base64Image = image.toString('base64');
        images.push(base64Image);
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
      let pageCount = 0;
      const document = await pdf(pdfPath);

      for await (const _ of document) {
        pageCount++;
      }

      return pageCount;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 0;
    }
  }
}
