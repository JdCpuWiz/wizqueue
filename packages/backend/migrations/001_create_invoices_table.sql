-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processing_error TEXT,
    extracted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_processed ON invoices(processed);
CREATE INDEX IF NOT EXISTS idx_invoices_upload_date ON invoices(upload_date DESC);

-- Add comments
COMMENT ON TABLE invoices IS 'Stores uploaded PDF invoices and their processing status';
COMMENT ON COLUMN invoices.filename IS 'Original filename of the uploaded PDF';
COMMENT ON COLUMN invoices.file_path IS 'Path to the stored file on disk';
COMMENT ON COLUMN invoices.processed IS 'Whether the invoice has been processed by Ollama';
COMMENT ON COLUMN invoices.processing_error IS 'Error message if processing failed';
COMMENT ON COLUMN invoices.extracted_data IS 'JSON array of extracted products';
