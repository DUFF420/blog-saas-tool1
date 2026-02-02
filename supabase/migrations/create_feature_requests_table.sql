-- Feature Requests Table
-- This table stores all user feature requests from various sources in the app

CREATE TABLE IF NOT EXISTS public.feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    request TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'planned', 'completed')),
    source TEXT NOT NULL CHECK (source IN ('header', 'wordpress', 'backlinks', 'general')),
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to profiles table (if it exists)
-- ALTER TABLE public.feature_requests 
--     ADD CONSTRAINT fk_user_id 
--     FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) 
--     ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON public.feature_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_source ON public.feature_requests(source);
CREATE INDEX IF NOT EXISTS idx_feature_requests_is_starred ON public.feature_requests(is_starred);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON public.feature_requests(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feature requests
CREATE POLICY "Users can view their own feature requests"
    ON public.feature_requests
    FOR SELECT
    USING (user_id = current_setting('request.jwt.claim.sub', true));

-- Policy: Users can insert their own feature requests
CREATE POLICY "Users can insert their own feature requests"
    ON public.feature_requests
    FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claim.sub', true));

-- Policy: Admins can view all feature requests (requires admin check in app layer)
-- Note: The actual admin access is controlled by the admin client with service role key

-- Add comment for documentation
COMMENT ON TABLE public.feature_requests IS 'Stores user feature requests and feedback from various sources (header, wordpress, backlinks, etc.)';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_requests_updated_at
    BEFORE UPDATE ON public.feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
