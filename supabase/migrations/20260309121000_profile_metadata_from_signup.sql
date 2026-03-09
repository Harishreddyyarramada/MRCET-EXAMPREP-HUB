-- Ensure signup metadata is stored on profile creation and backfilled for existing users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, roll_number, branch, year)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), ''),
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data->>'roll_number', ''),
    NULLIF(NEW.raw_user_meta_data->>'branch', ''),
    NULLIF(NEW.raw_user_meta_data->>'year', '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = CASE
      WHEN btrim(public.profiles.full_name) = ''
        THEN COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name)
      ELSE public.profiles.full_name
    END,
    email = CASE
      WHEN public.profiles.email = ''
        THEN COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email)
      ELSE public.profiles.email
    END,
    roll_number = COALESCE(public.profiles.roll_number, EXCLUDED.roll_number),
    branch = COALESCE(public.profiles.branch, EXCLUDED.branch),
    year = COALESCE(public.profiles.year, EXCLUDED.year);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

UPDATE public.profiles AS p
SET
  full_name = CASE
    WHEN btrim(p.full_name) = ''
      THEN COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), p.full_name)
    ELSE p.full_name
  END,
  roll_number = COALESCE(p.roll_number, NULLIF(u.raw_user_meta_data->>'roll_number', '')),
  branch = COALESCE(p.branch, NULLIF(u.raw_user_meta_data->>'branch', '')),
  year = COALESCE(p.year, NULLIF(u.raw_user_meta_data->>'year', '')),
  email = COALESCE(NULLIF(p.email, ''), u.email, '')
FROM auth.users AS u
WHERE p.user_id = u.id;
