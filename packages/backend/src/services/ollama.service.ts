import { ollamaClient, OLLAMA_MODEL } from '../config/ollama.js';
import { PdfService } from './pdf.service.js';
import type { ExtractedProduct } from '@wizqueue/shared';

export class OllamaService {
  private pdfService: PdfService;

  constructor() {
    this.pdfService = new PdfService();
  }

  /**
   * Extract products from PDF invoice using Ollama vision LLM
   * @param pdfPath Path to the PDF file
   * @returns Array of extracted products
   */
  async extractProductsFromPdf(pdfPath: string): Promise<ExtractedProduct[]> {
    try {
      console.log(`📄 Converting PDF to images: ${pdfPath}`);
      const images = await this.pdfService.convertPdfToImages(pdfPath);

      if (images.length === 0) {
        throw new Error('No images extracted from PDF');
      }

      console.log(`📸 Extracted ${images.length} page(s) from PDF`);

      // Process all pages and aggregate results
      const allProducts: ExtractedProduct[] = [];

      for (let i = 0; i < images.length; i++) {
        console.log(`🤖 Processing page ${i + 1}/${images.length} with Ollama...`);
        const products = await this.extractFromImage(images[i], i + 1);
        allProducts.push(...products);
      }

      console.log(`✅ Extracted ${allProducts.length} products total`);
      return this.deduplicateProducts(allProducts);
    } catch (error) {
      console.error('Error extracting products from PDF:', error);
      throw new Error(
        `Failed to extract products: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract products from a single image using Ollama
   */
  private async extractFromImage(
    base64Image: string,
    pageNumber: number
  ): Promise<ExtractedProduct[]> {
    const prompt = `You are an invoice parser. Extract ALL products from this invoice page.

Return ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "productName": "exact product name",
    "details": "specifications, color, size, material, etc.",
    "quantity": number
  }
]

Important:
- Extract every single product line item
- Include all relevant details (color, size, material, specifications)
- Quantity must be a number (default to 1 if not specified)
- If no products found, return empty array: []
- Return ONLY the JSON array, no markdown, no explanations`;

    try {
      const response = await ollamaClient.post('/api/generate', {
        model: OLLAMA_MODEL,
        prompt,
        images: [base64Image],
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent extraction
          top_p: 0.9,
        },
      });

      const rawResponse = response.data.response;
      console.log(`📝 Raw Ollama response (page ${pageNumber}):`, rawResponse.substring(0, 200));

      return this.parseOllamaResponse(rawResponse);
    } catch (error) {
      console.error(`Error calling Ollama for page ${pageNumber}:`, error);
      throw error;
    }
  }

  /**
   * Parse and validate Ollama response
   */
  private parseOllamaResponse(rawResponse: string): ExtractedProduct[] {
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleaned = rawResponse.trim();
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleaned = cleaned.trim();

      // Try to find JSON array in the response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON array found in response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed)) {
        console.warn('Response is not an array');
        return [];
      }

      // Validate and normalize each product
      const products: ExtractedProduct[] = [];
      for (const item of parsed) {
        if (this.isValidProduct(item)) {
          products.push({
            productName: String(item.productName).trim(),
            details: String(item.details || '').trim(),
            quantity: Number(item.quantity) || 1,
          });
        }
      }

      return products;
    } catch (error) {
      console.error('Error parsing Ollama response:', error);
      console.error('Raw response:', rawResponse);
      return [];
    }
  }

  /**
   * Validate product structure
   */
  private isValidProduct(item: any): boolean {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.productName === 'string' &&
      item.productName.trim().length > 0 &&
      (item.quantity === undefined || typeof item.quantity === 'number')
    );
  }

  /**
   * Remove duplicate products (same name and details)
   */
  private deduplicateProducts(products: ExtractedProduct[]): ExtractedProduct[] {
    const seen = new Map<string, ExtractedProduct>();

    for (const product of products) {
      const key = `${product.productName}|${product.details}`.toLowerCase();
      const existing = seen.get(key);

      if (existing) {
        // Merge quantities
        existing.quantity += product.quantity;
      } else {
        seen.set(key, { ...product });
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Test Ollama connectivity and model availability
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await ollamaClient.get('/api/tags');
      const models = response.data.models || [];
      const hasModel = models.some((m: any) => m.name === OLLAMA_MODEL);

      if (!hasModel) {
        console.warn(`⚠️  Model ${OLLAMA_MODEL} not found. Available models:`, models.map((m: any) => m.name));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }
}
