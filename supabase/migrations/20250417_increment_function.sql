
-- Function to increment a value in a column
CREATE OR REPLACE FUNCTION public.increment(row_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_val int;
BEGIN
  SELECT playlists_generated INTO current_val FROM public.profiles WHERE id = row_id;
  
  IF current_val IS NULL THEN
    current_val := 0;
  END IF;
  
  RETURN current_val + 1;
END;
$$;

-- Function to track playlist generation
CREATE OR REPLACE FUNCTION public.increment_playlist_count()
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  current_val int;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  UPDATE public.profiles
  SET playlists_generated = playlists_generated + 1
  WHERE id = user_id
  RETURNING playlists_generated INTO current_val;
  
  RETURN current_val;
END;
$$;
