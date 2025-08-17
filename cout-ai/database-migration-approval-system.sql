-- =====================================================
-- Cout.AI User Approval System Database Migration
-- =====================================================
-- This migration adds manual user approval functionality
-- Run this in Supabase SQL Editor to add approval system

-- Create user_approvals table
CREATE TABLE user_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(255), -- Admin identifier who approved/denied
    denial_reason TEXT,
    notes TEXT, -- Optional admin notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_approvals_user_id ON user_approvals(user_id);
CREATE INDEX idx_user_approvals_email ON user_approvals(email);
CREATE INDEX idx_user_approvals_status ON user_approvals(status);
CREATE INDEX idx_user_approvals_requested_at ON user_approvals(requested_at DESC);

-- Enable Row Level Security
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own approval status
CREATE POLICY "Users can view own approval status" ON user_approvals
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Only service role can insert/update approval records
-- (This will be used by the backend and admin operations)
CREATE POLICY "Service role can manage approvals" ON user_approvals
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to update timestamp on approval status change
CREATE OR REPLACE FUNCTION update_user_approval_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Set approved_at timestamp when status changes to approved
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        NEW.approved_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_user_approval_timestamp
    BEFORE UPDATE ON user_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_user_approval_timestamp();

-- =====================================================
-- Admin Helper Views and Functions
-- =====================================================

-- View for pending approvals (admin convenience)
CREATE VIEW pending_user_approvals AS
SELECT 
    ua.id,
    ua.email,
    ua.requested_at,
    ua.notes,
    au.created_at as account_created,
    EXTRACT(DAY FROM (NOW() - ua.requested_at)) as days_pending
FROM user_approvals ua
JOIN auth.users au ON ua.user_id = au.id
WHERE ua.status = 'pending'
ORDER BY ua.requested_at ASC;

-- Function to approve a user (admin helper)
CREATE OR REPLACE FUNCTION approve_user(
    user_email VARCHAR(255),
    admin_identifier VARCHAR(255) DEFAULT 'admin',
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE user_approvals 
    SET 
        status = 'approved',
        approved_by = admin_identifier,
        notes = COALESCE(admin_notes, notes)
    WHERE email = user_email AND status = 'pending';
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to deny a user (admin helper)
CREATE OR REPLACE FUNCTION deny_user(
    user_email VARCHAR(255),
    admin_identifier VARCHAR(255) DEFAULT 'admin',
    reason TEXT DEFAULT 'Not specified',
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE user_approvals 
    SET 
        status = 'denied',
        approved_by = admin_identifier,
        denial_reason = reason,
        notes = COALESCE(admin_notes, notes)
    WHERE email = user_email AND status = 'pending';
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Admin Queries (for copy-paste convenience)
-- =====================================================

/*
-- View all pending approvals:
SELECT * FROM pending_user_approvals;

-- Approve a user:
SELECT approve_user('user@example.com', 'admin@yoursite.com', 'Approved after verification');

-- Deny a user:
SELECT deny_user('user@example.com', 'admin@yoursite.com', 'Invalid email domain', 'Corporate email required');

-- View all approvals with status:
SELECT 
    email,
    status,
    requested_at,
    approved_at,
    approved_by,
    denial_reason,
    notes
FROM user_approvals 
ORDER BY requested_at DESC;

-- Get user approval status by email:
SELECT status, requested_at, approved_at 
FROM user_approvals 
WHERE email = 'user@example.com';
*/

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables and functions are created successfully
-- 3. Test the helper functions with sample data if needed
-- 4. Proceed to modify the registration flow 