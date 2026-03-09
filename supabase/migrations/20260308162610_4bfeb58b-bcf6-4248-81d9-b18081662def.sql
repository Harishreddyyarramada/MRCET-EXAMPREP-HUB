-- Remove 'student' role from users who also have 'faculty' or 'admin' role
DELETE FROM public.user_roles
WHERE role = 'student'
AND user_id IN (
  SELECT user_id FROM public.user_roles WHERE role IN ('faculty', 'admin')
);