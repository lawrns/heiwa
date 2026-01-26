-- Migration: Keep surf_camps.available_spots in sync
-- Date: 2025-12-12
-- Purpose:
--  - Backfill `surf_camps.available_spots` from enrollments
--  - Add a trigger so changes to `surf_camp_enrollments` keep availability accurate
--
-- Notes:
--  - Counts enrollments with status IN ('pending','confirmed','enrolled')
--  - Uses COALESCE(total_spots, max_participants, 0) as capacity

BEGIN;

-- Backfill availability for all camps
WITH counts AS (
  SELECT surf_camp_id, COUNT(*)::int AS enrolled
  FROM public.surf_camp_enrollments
  WHERE status IN ('pending','confirmed','enrolled')
  GROUP BY surf_camp_id
)
UPDATE public.surf_camps s
SET available_spots = GREATEST(0, COALESCE(s.total_spots, s.max_participants, 0) - COALESCE(c.enrolled, 0))
FROM counts c
WHERE s.id = c.surf_camp_id;

WITH counts AS (
  SELECT DISTINCT surf_camp_id
  FROM public.surf_camp_enrollments
  WHERE status IN ('pending','confirmed','enrolled')
)
UPDATE public.surf_camps s
SET available_spots = GREATEST(0, COALESCE(s.total_spots, s.max_participants, 0))
WHERE NOT EXISTS (SELECT 1 FROM counts c WHERE c.surf_camp_id = s.id);

CREATE OR REPLACE FUNCTION public.recalc_surf_camp_available_spots(p_surf_camp_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.surf_camps s
  SET available_spots = GREATEST(
    0,
    COALESCE(s.total_spots, s.max_participants, 0) - (
      SELECT COUNT(*)::int
      FROM public.surf_camp_enrollments e
      WHERE e.surf_camp_id = p_surf_camp_id
        AND e.status IN ('pending','confirmed','enrolled')
    )
  )
  WHERE s.id = p_surf_camp_id;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_surf_camp_available_spots()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.surf_camp_id IS DISTINCT FROM NEW.surf_camp_id THEN
    PERFORM public.recalc_surf_camp_available_spots(OLD.surf_camp_id);
    PERFORM public.recalc_surf_camp_available_spots(NEW.surf_camp_id);
  ELSE
    PERFORM public.recalc_surf_camp_available_spots(COALESCE(NEW.surf_camp_id, OLD.surf_camp_id));
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS surf_camp_enrollments_recalc_available_spots ON public.surf_camp_enrollments;
CREATE TRIGGER surf_camp_enrollments_recalc_available_spots
AFTER INSERT OR UPDATE OR DELETE ON public.surf_camp_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.trg_recalc_surf_camp_available_spots();

COMMIT;

