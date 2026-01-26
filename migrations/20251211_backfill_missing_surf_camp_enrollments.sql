-- Migration: Backfill missing surf camp enrollments from booking notes
-- Date: 2025-12-11
-- Purpose:
--  - Create missing `surf_camp_enrollments` rows for bookings whose dates match a surf camp
--    and whose `bookings.notes` contains a JSON `participants` array.
--  - Ensure existing enrollments are linked to their booking via `booking_id` when possible.

-- Safely parse JSON stored in `bookings.notes` (notes is TEXT in this project).
-- If notes is not valid JSON, returns NULL.
CREATE OR REPLACE FUNCTION public.try_parse_jsonb(input_text text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN input_text::jsonb;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- 1) Backfill missing enrollments
WITH candidate_bookings AS (
  SELECT
    b.id AS booking_id,
    b.check_in,
    b.check_out,
    public.try_parse_jsonb(b.notes) AS notes_json
  FROM bookings b
  WHERE b.check_in IS NOT NULL
    AND b.check_out IS NOT NULL
    AND b.notes IS NOT NULL
),
matched_bookings AS (
  SELECT
    cb.booking_id,
    s.id AS surf_camp_id,
    cb.notes_json
  FROM candidate_bookings cb
  JOIN surf_camps s
    ON s.start_date = cb.check_in
   AND s.end_date = cb.check_out
  WHERE cb.notes_json IS NOT NULL
    AND jsonb_typeof(cb.notes_json) = 'object'
    AND jsonb_typeof(cb.notes_json->'participants') = 'array'
),
participants AS (
  SELECT
    mb.booking_id,
    mb.surf_camp_id,
    p.value AS participant
  FROM matched_bookings mb
  CROSS JOIN LATERAL jsonb_array_elements(mb.notes_json->'participants') AS p(value)
),
resolved AS (
  SELECT
    p.booking_id,
    p.surf_camp_id,
    COALESCE(
      CASE
        WHEN (p.participant->>'clientId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (p.participant->>'clientId')::uuid
        ELSE NULL
      END,
      c.id
    ) AS client_id,
    COALESCE(NULLIF(p.participant->>'name', ''), 'Guest') AS participant_name,
    NULLIF(p.participant->>'email', '') AS participant_email,
    NULLIF(p.participant->>'phone', '') AS participant_phone,
    NULLIF(p.participant->>'skillLevel', '') AS skill_level,
    NULLIF(p.participant->>'dietaryRequirements', '') AS dietary_restrictions,
    CASE
      WHEN (p.participant ? 'emergencyContact') THEN (p.participant->'emergencyContact')
      ELSE NULL
    END AS emergency_contact,
    NULLIF(p.participant->>'specialRequests', '') AS notes
  FROM participants p
  LEFT JOIN clients c
    ON c.email = (p.participant->>'email')
)
INSERT INTO surf_camp_enrollments (
  surf_camp_id,
  client_id,
  booking_id,
  participant_name,
  participant_email,
  participant_phone,
  status,
  skill_level,
  dietary_restrictions,
  emergency_contact,
  notes
)
SELECT
  r.surf_camp_id,
  r.client_id,
  r.booking_id,
  r.participant_name,
  r.participant_email,
  r.participant_phone,
  'pending'::text,
  r.skill_level,
  r.dietary_restrictions,
  r.emergency_contact,
  r.notes
FROM resolved r
WHERE r.client_id IS NOT NULL
  AND r.participant_email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM surf_camp_enrollments e
    WHERE e.booking_id = r.booking_id
      AND e.surf_camp_id = r.surf_camp_id
      AND e.client_id = r.client_id
      AND COALESCE(e.participant_email, '') = COALESCE(r.participant_email, '')
      AND COALESCE(e.participant_name, '') = COALESCE(r.participant_name, '')
  );

-- 2) Link existing enrollments to bookings when booking_id is missing but can be inferred
WITH candidate_bookings AS (
  SELECT
    b.id AS booking_id,
    b.check_in,
    b.check_out,
    public.try_parse_jsonb(b.notes) AS notes_json
  FROM bookings b
  WHERE b.check_in IS NOT NULL
    AND b.check_out IS NOT NULL
    AND b.notes IS NOT NULL
),
matched_bookings AS (
  SELECT
    cb.booking_id,
    s.id AS surf_camp_id,
    cb.notes_json
  FROM candidate_bookings cb
  JOIN surf_camps s
    ON s.start_date = cb.check_in
   AND s.end_date = cb.check_out
  WHERE cb.notes_json IS NOT NULL
    AND jsonb_typeof(cb.notes_json) = 'object'
    AND jsonb_typeof(cb.notes_json->'participants') = 'array'
),
participants AS (
  SELECT
    mb.booking_id,
    mb.surf_camp_id,
    p.value AS participant
  FROM matched_bookings mb
  CROSS JOIN LATERAL jsonb_array_elements(mb.notes_json->'participants') AS p(value)
),
resolved AS (
  SELECT
    p.booking_id,
    p.surf_camp_id,
    COALESCE(
      CASE
        WHEN (p.participant->>'clientId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN (p.participant->>'clientId')::uuid
        ELSE NULL
      END,
      c.id
    ) AS client_id,
    NULLIF(p.participant->>'email', '') AS participant_email
  FROM participants p
  LEFT JOIN clients c
    ON c.email = (p.participant->>'email')
)
UPDATE surf_camp_enrollments e
SET booking_id = r.booking_id
FROM resolved r
WHERE e.booking_id IS NULL
  AND e.surf_camp_id = r.surf_camp_id
  AND e.client_id = r.client_id
  AND COALESCE(e.participant_email, '') = COALESCE(r.participant_email, '');

DROP FUNCTION public.try_parse_jsonb(text);

