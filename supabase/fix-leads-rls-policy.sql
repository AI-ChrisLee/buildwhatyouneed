-- Fix leads table RLS policy to allow anonymous inserts
-- This is necessary for the lead capture form on the landing page

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can view their own lead" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;

-- Enable RLS on leads table
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous inserts (for lead capture form)
CREATE POLICY "Anyone can insert leads" ON leads
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy 2: Users can view their own lead record
CREATE POLICY "Users can view their own lead" ON leads
    FOR SELECT
    TO authenticated
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy 3: Admins can view and manage all leads
CREATE POLICY "Admins can manage all leads" ON leads
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'leads'
ORDER BY policyname;