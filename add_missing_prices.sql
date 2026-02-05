-- Add prices to existing order_services based on default pricing
-- This ensures all services have prices so totalAmount can be calculated

-- Update order_services with default prices
UPDATE order_services
SET price = CASE
    WHEN service_name = 'Professional Photography' THEN 300
    WHEN service_name = 'Real Estate Photography' THEN 300
    WHEN service_name = 'Video Walkthrough' THEN 350
    WHEN service_name = 'Property Video Tours' THEN 350
    WHEN service_name = 'Drone Photos & Films' THEN 300
    WHEN service_name = 'Drone Footage' THEN 300
    WHEN service_name = 'Floor Plans' THEN 100
    WHEN service_name = '360 / Virtual Tours' THEN 400
    WHEN service_name = '3D Tours' THEN 400
    ELSE 150 -- default price
END
WHERE price IS NULL OR price = 0;

-- Check the results:
SELECT 
    o.id as order_id,
    o.status,
    o.payment_status,
    os.service_name,
    os.price,
    (SELECT SUM(price) FROM order_services WHERE order_id = o.id) as total
FROM orders o
LEFT JOIN order_services os ON os.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 10;
