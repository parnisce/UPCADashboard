-- Helper function to check if the current user is an admin
-- This function checks the 'role' column in the 'profiles' table.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'upca_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Enable RLS on Orders (if not already enabled)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (optional, but safe)
DROP POLICY IF EXISTS "Agents can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- 3. Create Policy: Agents can view ONLY their own orders
CREATE POLICY "Agents can view own orders"
ON orders FOR SELECT
USING (auth.uid() = agent_id);

-- 4. Create Policy: Admins can view ALL orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (is_admin());

-- 5. Create Policy: Users can create orders (assigning themselves as agent)
-- We enforce that agent_id matches auth.uid()
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = agent_id);

-- 6. Create Policy: Admins can update any order (e.g. status)
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (is_admin());

-- 7. Create Policy: Agents can update their own orders
CREATE POLICY "Agents can update own orders"
ON orders FOR UPDATE
USING (auth.uid() = agent_id);

-- Apply similar logic to other tables if needed
-- e.g. properties, assets, order_services
