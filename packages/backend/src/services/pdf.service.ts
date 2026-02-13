import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, Canvas } from 'canvas';
import fs from 'fs/promises';

// Canvas factory for node-canvas integration with PDF.js
class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas,
      context,
    };
  }

  reset(canvasAndContext: { canvas: Canvas; context: any }, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext: { canvas: Canvas; context: any }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

export class PdfService {
  /**
   * Convert PDF to base64-encoded images
   * @param pdfPath Path to the PDF file
   * @returns Array of base64-encoded images
   */
  async convertPdfToImages(pdfPath: string): Promise<string[]> {
    try {
      const images: string[] = [];

      // Read PDF file
      const data = new Uint8Array(await fs.readFile(pdfPath));

      // Create canvas factory for PDF.js
      const canvasFactory = new NodeCanvasFactory();

      // Load PDF document with canvas factory
      const loadingTask = pdfjsLib.getDocument({
        data,
        verbosity: 0,
        canvasFactory: canvasFactory as any,
      } as any);
      const pdfDocument = await loadingTask.promise;

      // Process each page
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);

        // Set scale for good quality (2x = 144 DPI)
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        // Create canvas using factory
        const canvasAndContext = canvasFactory.create(
          Math.floor(viewport.width),
          Math.floor(viewport.height)
        );

        // Render PDF page to canvas
        const renderContext = {
          canvasContext: canvasAndContext.context,
          viewport: viewport,
        };

        await page.render(renderContext as any).promise;

        // Convert canvas to base64 PNG
        const base64Image = canvasAndContext.canvas.toBuffer('image/png').toString('base64');
        images.push(base64Image);

        // Clean up
        canvasFactory.destroy(canvasAndContext);
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
      const data = new Uint8Array(await fs.readFile(pdfPath));
      const loadingTask = pdfjsLib.getDocument({
        data,
        verbosity: 0,
      } as any);
      const pdfDocument = await loadingTask.promise;
      return pdfDocument.numPages;
    } catch (error) {
      console.error('Error getting page count:', error);
      return 1;
    }
  }
}
