import { pool } from '../config/database.js';
import type { Invoice, ExtractedProduct } from '@wizqueue/shared';

export class InvoiceModel {
  static async create(filename: string, filePath: string): Promise<Invoice> {
    const query = `
      INSERT INTO invoices (filename, file_path)
      VALUES ($1, $2)
      RETURNING
        id, filename, file_path as "filePath",
        upload_date as "uploadDate", processed, processing_error as "processingError",
        extracted_data as "extractedData", created_at as "createdAt"
    `;
    const result = await pool.query(query, [filename, filePath]);
    return result.rows[0];
  }

  static async findById(id: number): Promise<Invoice | null> {
    const query = `
      SELECT
        id, filename, file_path as "filePath",
        upload_date as "uploadDate", processed, processing_error as "processingError",
        extracted_data as "extractedData", created_at as "createdAt"
      FROM invoices
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async markAsProcessed(
    id: number,
    extractedData: ExtractedProduct[]
  ): Promise<void> {
    const query = `
      UPDATE invoices
      SET processed = true, extracted_data = $1
      WHERE id = $2
    `;
    await pool.query(query, [JSON.stringify(extractedData), id]);
  }

  static async markAsFailed(id: number, error: string): Promise<void> {
    const query = `
      UPDATE invoices
      SET processed = false, processing_error = $1
      WHERE id = $2
    `;
    await pool.query(query, [error, id]);
  }

  static async findAll(limit = 50): Promise<Invoice[]> {
    const query = `
      SELECT
        id, filename, file_path as "filePath",
        upload_date as "uploadDate", processed, processing_error as "processingError",
        extracted_data as "extractedData", created_at as "createdAt"
      FROM invoices
      ORDER BY upload_date DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}
