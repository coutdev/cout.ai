-- CoutAI Database Migration: Multiple Chat Sessions Support
-- Run these commands in your Supabase SQL Editor

-- Step 1: Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0
);

-- Step 2: Add session_id to existing chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Step 4: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger for auto-updating timestamps
CREATE OR REPLACE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON chat_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create function to update message count
CREATE OR REPLACE FUNCTION update_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_sessions 
        SET message_count = message_count + 1,
            updated_at = NOW()
        WHERE id = NEW.session_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE chat_sessions 
        SET message_count = message_count - 1,
            updated_at = NOW()
        WHERE id = OLD.session_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Step 7: Create trigger for message count updates
CREATE OR REPLACE TRIGGER update_session_message_count_trigger
    AFTER INSERT OR DELETE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_session_message_count();

-- Step 8: Row Level Security for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 9: Update existing RLS policy for chat_messages to include session check
DROP POLICY IF EXISTS "Users can only see their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;

CREATE POLICY "Users can only see their own messages" ON chat_messages
  FOR ALL USING (
    auth.uid() = user_id AND 
    (session_id IS NULL OR session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    (session_id IS NULL OR session_id IN (
      SELECT id FROM chat_sessions WHERE user_id = auth.uid()
    ))
  );

-- Step 10: Create default session for existing users with messages
INSERT INTO chat_sessions (user_id, title, created_at, message_count)
SELECT 
  user_id,
  'Chat Session 1' as title,
  MIN(created_at) as created_at,
  COUNT(*) as message_count
FROM chat_messages 
WHERE session_id IS NULL
GROUP BY user_id
ON CONFLICT DO NOTHING;

-- Step 11: Update existing messages to belong to default sessions
UPDATE chat_messages 
SET session_id = (
  SELECT s.id 
  FROM chat_sessions s 
  WHERE s.user_id = chat_messages.user_id 
  AND s.title = 'Chat Session 1'
  LIMIT 1
)
WHERE session_id IS NULL;

-- Verification queries (optional - for testing)
-- SELECT COUNT(*) as total_sessions FROM chat_sessions;
-- SELECT COUNT(*) as messages_with_sessions FROM chat_messages WHERE session_id IS NOT NULL;
-- SELECT COUNT(*) as messages_without_sessions FROM chat_messages WHERE session_id IS NULL; 