-- Launch Interests Table for Product Launch Notifications
CREATE TABLE IF NOT EXISTS launch_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,  -- e.g., 'FreelancePro Command Center'
    user_id TEXT,  -- Clerk ID (nullable for anonymous)
    user_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_launch_interests_product ON launch_interests(product_name);
CREATE INDEX IF NOT EXISTS idx_launch_interests_user ON launch_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_launch_interests_created ON launch_interests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE launch_interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can register interest" ON launch_interests;
DROP POLICY IF EXISTS "Admins can view interests" ON launch_interests;

-- RLS Policy: Users can insert their own interest
CREATE POLICY "Users can register interest"
    ON launch_interests FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'sub' = user_id OR user_id IS NULL
    );

-- RLS Policy: Only admins can view all interests
CREATE POLICY "Admins can view interests"
    ON launch_interests FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Grant permissions
GRANT ALL ON launch_interests TO authenticated;
GRANT ALL ON launch_interests TO service_role;
