import { Request, Response, NextFunction } from 'express';
import { InvoiceModel } from '../models/invoice.model.js';
import { OllamaService } from '../services/ollama.service.js';
import type { ApiResponse } from '@wizqueue/shared';
import fs from 'fs/promises';

const ollamaService = new OllamaService();

export class UploadController {
  async uploadInvoice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      console.log('📤 Upload request received');
      console.log('  Content-Type:', req.headers['content-type']);
      console.log('  File:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'none');

      if (!req.file) {
        console.error('❌ No file in request');
        res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const { filename, path: filePath } = req.file;
      console.log(`📝 Creating invoice record for: ${filename}`);

      // Create invoice record
      const invoice = await InvoiceModel.create(filename, filePath);
      console.log(`✅ Invoice created with ID: ${invoice.id}`);

      // Start processing in background
      console.log(`🚀 Starting background processing for invoice ${invoice.id}`);
      this.processInvoiceAsync(invoice.id, filePath);

      res.status(201).json({
        success: true,
        data: {
          invoiceId: invoice.id,
          filename: invoice.filename,
          message: 'Invoice uploaded successfully. Processing started.',
        },
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  }

  async getInvoiceStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid ID',
        });
        return;
      }

      const invoice = await InvoiceModel.findById(id);
      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          invoiceId: invoice.id,
          processed: invoice.processed,
          processingError: invoice.processingError,
          extractedData: invoice.extractedData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllInvoices(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const invoices = await InvoiceModel.findAll(limit);

      res.json({
        success: true,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process invoice asynchronously
   */
  private async processInvoiceAsync(invoiceId: number, filePath: string): Promise<void> {
    try {
      console.log(`🚀 Starting background processing for invoice ${invoiceId}`);

      const extractedProducts = await ollamaService.extractProductsFromPdf(filePath);

      await InvoiceModel.markAsProcessed(invoiceId, extractedProducts);

      console.log(`✅ Invoice ${invoiceId} processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing invoice ${invoiceId}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await InvoiceModel.markAsFailed(invoiceId, errorMessage);
    }
  }
}
