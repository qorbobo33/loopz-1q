-- Add foreign key from posts to profiles to enable PostgREST relationships
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_fkey_profiles
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
