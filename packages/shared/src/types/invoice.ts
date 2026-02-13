export interface Invoice {
  id: number;
  filename: string;
  filePath: string | null;
  uploadDate: string;
  processed: boolean;
  processingError: string | null;
  extractedData: ExtractedProduct[] | null;
  createdAt: string;
}

export interface ExtractedProduct {
  productName: string;
  details: string;
  quantity: number;
}

export interface InvoiceUploadResponse {
  invoiceId: number;
  filename: string;
  message: string;
}

export interface InvoiceProcessingStatus {
  invoiceId: number;
  processed: boolean;
  processingError: string | null;
  extractedData: ExtractedProduct[] | null;
}
