
-- Fix overly permissive notifications INSERT policy
DROP POLICY "System can create notifications" ON public.notifications;

-- Only allow inserting notifications for the authenticated user or by faculty/admin
CREATE POLICY "Users can receive notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'faculty') 
    OR public.has_role(auth.uid(), 'admin')
  );
