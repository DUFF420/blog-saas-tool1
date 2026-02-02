-- User Notices Table for Admin-Managed User Notifications
CREATE TABLE IF NOT EXISTS user_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,  -- Clerk user ID
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT NOT NULL,  -- Admin Clerk ID who created the notice
    dismissed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notices_user_id ON user_notices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notices_active ON user_notices(user_id) 
    WHERE dismissed_at IS NULL AND deleted_at IS NULL;

-- Enable Row Level Security
ALTER TABLE user_notices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notices" ON user_notices;
DROP POLICY IF EXISTS "Admins can manage all notices" ON user_notices;

-- RLS Policy: Users can only view their own active notices
CREATE POLICY "Users can view own notices"
    ON user_notices FOR SELECT
    USING (
        auth.jwt() ->> 'sub' = user_id 
        AND dismissed_at IS NULL 
        AND deleted_at IS NULL
    );

-- RLS Policy: Only admins can insert/update/delete notices
CREATE POLICY "Admins can manage all notices"
    ON user_notices FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_notices_updated_at_trigger ON user_notices;
CREATE TRIGGER update_user_notices_updated_at_trigger
    BEFORE UPDATE ON user_notices
    FOR EACH ROW
    EXECUTE FUNCTION update_user_notices_updated_at();

-- Grant permissions
GRANT ALL ON user_notices TO authenticated;
GRANT ALL ON user_notices TO service_role;
