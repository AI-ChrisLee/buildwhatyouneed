-- ========================================
-- FIX LEADS TABLE POLICY FOR PRODUCTION
-- ========================================
-- The landing page needs to insert leads without authentication

-- Drop the existing admin-only policy
DROP POLICY IF EXISTS "Admin can view all leads" ON public.leads;

-- Create new policies
-- Allow anyone to insert leads (for landing page opt-in)
CREATE POLICY "Anyone can create leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Only admins can view/update/delete leads
CREATE POLICY "Admin can manage leads" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

CREATE POLICY "Admin can update leads" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

CREATE POLICY "Admin can delete leads" ON public.leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Verify the fix
SELECT 'Leads table policies updated! Anonymous users can now insert leads.' as message;