-- Create services table
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

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
CREATE POLICY "Only admins can modify services" ON services 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'upca_admin'
        )
    );

-- Initial data
INSERT INTO services (id, name, base_price, description, features, icon)
VALUES 
    ('Real Estate Photography', 'Real Estate Photography', 300, 'Professional property photography with HDR processing', '{ "25-35 HDR Photos", "Same-day turnaround", "Web & print optimized" }', 'Camera'),
    ('Property Video Tours', 'Property Video Tours', 350, 'Cinematic walkthrough videos with music', '{ "2-3 minute video", "Professional editing", "Music licensing included" }', 'Video'),
    ('360 / Virtual Tours', '360 / Virtual Tours', 400, 'Interactive 360° virtual tour experience', '{ "Matterport 3D tour", "Floor plan included", "Unlimited hosting" }', 'Box'),
    ('Drone Photos & Films', 'Drone Photos & Films', 300, 'Aerial photography and videography', '{ "10-15 aerial photos", "1-minute aerial video", "Weather permitting" }', 'Plane'),
    ('Property Microsites & Agent Websites', 'Property Microsites & Agent Websites', 1000, 'Custom property website with all media', '{ "Custom domain", "All media integrated", "Lead capture forms" }', 'Globe'),
    ('Full-Service Real Estate Marketing', 'Full-Service Real Estate Marketing', 1200, 'Complete marketing package for luxury properties', '{ "All services included", "Social media content", "Print materials" }', 'ShoppingCart')
ON CONFLICT (id) DO UPDATE SET 
    base_price = EXCLUDED.base_price,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    icon = EXCLUDED.icon;
