
-- Create an RPC to safely increment download_count without requiring UPDATE permission
CREATE OR REPLACE FUNCTION public.increment_download_count(paper_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.papers SET download_count = download_count + 1 WHERE id = paper_id;
END;
$$;
