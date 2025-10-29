-- Add foreign key from notifications.related_user_id to profiles.id
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_related_user_id_fkey_profiles
FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
