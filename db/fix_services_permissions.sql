-- 1. Update profiles table constraint to allow 'admin' role if it exists
DO $$ 
BEGIN 
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('agent', 'brokerage_admin', 'upca_admin', 'admin'));
END $$;

-- 2. Update existing admin profiles to have consistent role if needed
-- (Optional, but helps if there's confusion between 'admin' and 'upca_admin')
-- UPDATE profiles SET role = 'upca_admin' WHERE role = 'admin';

-- 3. Update services table policies to be more inclusive
DROP POLICY IF EXISTS "Only admins can modify services" ON services;
CREATE POLICY "Only admins can modify services" ON services
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('upca_admin', 'admin')
        )
    );

-- 4. Ensure services are viewable by everyone (verify policy exists and is correct)
-- Sometimes 'true' is not enough if RLS is not enabled or if there are conflicting policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);

-- 5. If the table doesn't exist, create it (just in case the previous script failed)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
