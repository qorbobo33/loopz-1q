-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator', -- 'admin' or 'moderator'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_own" ON public.admin_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "admin_insert_admin_only" ON public.admin_users FOR INSERT WITH CHECK (FALSE);
CREATE POLICY "admin_update_admin_only" ON public.admin_users FOR UPDATE USING (FALSE);
