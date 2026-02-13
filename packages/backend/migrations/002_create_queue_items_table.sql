-- Create queue_items table
CREATE TABLE IF NOT EXISTS queue_items (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    details TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT position_non_negative CHECK (position >= 0),
    CONSTRAINT status_valid CHECK (status IN ('pending', 'printing', 'completed', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_queue_items_position ON queue_items(position);
CREATE INDEX IF NOT EXISTS idx_queue_items_status ON queue_items(status);
CREATE INDEX IF NOT EXISTS idx_queue_items_invoice_id ON queue_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_queue_items_created_at ON queue_items(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_queue_items_updated_at
    BEFORE UPDATE ON queue_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE queue_items IS 'Stores 3D printing queue items';
COMMENT ON COLUMN queue_items.product_name IS 'Name of the product to be printed';
COMMENT ON COLUMN queue_items.details IS 'Additional details like color, size, material';
COMMENT ON COLUMN queue_items.quantity IS 'Number of items to print';
COMMENT ON COLUMN queue_items.position IS 'Position in the queue (0-indexed)';
COMMENT ON COLUMN queue_items.status IS 'Current status: pending, printing, completed, cancelled';
COMMENT ON COLUMN queue_items.invoice_id IS 'Reference to the source invoice';
COMMENT ON COLUMN queue_items.priority IS 'Priority level (higher = more urgent)';
COMMENT ON COLUMN queue_items.notes IS 'Additional notes or instructions';
