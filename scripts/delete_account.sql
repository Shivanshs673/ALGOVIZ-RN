-- Run in Supabase SQL Editor for App Store account deletion compliance.
-- Allows authenticated users to delete their own auth.users row.

CREATE OR REPLACE FUNCTION public.delete_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_account() TO authenticated;
