-- Fix the rogue trigger that was forcefully overriding the frontend's owner_id

CREATE OR REPLACE FUNCTION public.set_owner_context()
RETURNS TRIGGER AS $$
DECLARE
  p record;
BEGIN
  SELECT org_id, ancestor_ids INTO p FROM public.profiles WHERE id = auth.uid();

  IF p IS NOT NULL THEN
    NEW.org_id := p.org_id;
    -- ONLY set owner_id if it's not already provided by the frontend.
    -- The RLS policy handles security to prevent unauthorized spoofs.
    NEW.owner_id := coalesce(NEW.owner_id, auth.uid());
    
    -- Correctly pull the ancestors for the resulting owner
    SELECT ancestor_ids INTO NEW.owner_ancestor_ids 
    FROM public.profiles WHERE id = NEW.owner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
