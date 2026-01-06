-- Add missing database indexes for performance optimization
-- These indexes cover frequently queried columns that were not indexed in original table creation

-- =============================================================================
-- saju_results table indexes
-- =============================================================================

-- Index for filtering by user_id (used in profile page, getUserSajuResults)
CREATE INDEX IF NOT EXISTS idx_saju_results_user_id
  ON saju_results(user_id);

-- Composite index for user results ordered by date (used in profile page pagination)
CREATE INDEX IF NOT EXISTS idx_saju_results_user_created
  ON saju_results(user_id, created_at DESC);

-- =============================================================================
-- usage_tracking table indexes
-- =============================================================================

-- Composite index for usage limit checks (used in checkUsageLimit)
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_action
  ON usage_tracking(user_id, action_type);

-- =============================================================================
-- conversations table indexes
-- =============================================================================

-- Composite index for finding existing conversations by context
-- (used in saveConversation, getConversation)
CREATE INDEX IF NOT EXISTS idx_conversations_user_context
  ON conversations(user_id, context_type, context_id);

-- Index for user's conversations list
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
  ON conversations(user_id, updated_at DESC);

-- =============================================================================
-- subscriptions table indexes (if exists)
-- =============================================================================

-- Index for subscription lookups by user_id (used in stripe webhook)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);
