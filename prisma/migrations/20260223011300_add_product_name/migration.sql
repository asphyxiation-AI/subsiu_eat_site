-- Add productName column to OrderItem table
ALTER TABLE "OrderItem" ADD COLUMN "productName" TEXT NOT NULL DEFAULT 'Блюдо';
