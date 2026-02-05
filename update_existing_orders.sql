-- Update all existing orders to have payment status 'paid' and ensure they have amounts
-- This is a one-time fix for existing orders

UPDATE orders 
SET payment_status = 'paid'
WHERE payment_status IS NULL OR payment_status = 'pending';

-- If you want to check the results:
-- SELECT id, status, payment_status FROM orders;
