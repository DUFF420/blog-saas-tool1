-- Phase 34: Add viewed_at tracking for unread post indicators
-- This enables persistent "unread" glow animation until user opens post

-- Add viewed_at column
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Set existing posts as already viewed (to avoid false positives)
UPDATE posts 
SET viewed_at = updated_at 
WHERE viewed_at IS NULL 
  AND status IN ('drafts', 'ready', 'published');

-- Create index for performance (filtering by viewed_at)
CREATE INDEX IF NOT EXISTS idx_posts_viewed_at ON posts(viewed_at);

-- Comments for documentation
COMMENT ON COLUMN posts.viewed_at IS 'Timestamp when user last viewed/opened this post. Used to determine unread state for glow animation.';
