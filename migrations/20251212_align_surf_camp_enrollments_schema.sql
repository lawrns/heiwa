-- Migration: Align surf_camp_enrollments schema with production
-- Date: 2025-12-12
-- Purpose:
--  - Remove outdated uniqueness assumptions (one enrollment per client per camp).
--  - Add participant_* fields and payment fields used by the app.
--  - Align FK delete behavior (client deletion should not break historical enrollments).
--  - Expand allowed status values to include legacy 'enrolled'.

BEGIN;

-- 1) Drop any UNIQUE constraint on (surf_camp_id, client_id) if it exists
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.surf_camp_enrollments'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(surf_camp_id, client_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.surf_camp_enrollments DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;
END $$;

-- 2) Columns used by the app (match production reality)
ALTER TABLE public.surf_camp_enrollments
  ADD COLUMN IF NOT EXISTS participant_name text,
  ADD COLUMN IF NOT EXISTS participant_email text,
  ADD COLUMN IF NOT EXISTS participant_phone text,
  ADD COLUMN IF NOT EXISTS payment_status varchar,
  ADD COLUMN IF NOT EXISTS total_amount numeric,
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS dietary_restrictions text,
  ADD COLUMN IF NOT EXISTS emergency_contact jsonb,
  ADD COLUMN IF NOT EXISTS enrolled_at timestamptz DEFAULT now();

-- 3) Backfill required participant fields for existing rows (best-effort)
UPDATE public.surf_camp_enrollments e
SET
  participant_name = COALESCE(e.participant_name, c.name, 'Guest'),
  participant_email = COALESCE(e.participant_email, c.email, ''),
  participant_phone = COALESCE(e.participant_phone, c.phone)
FROM public.clients c
WHERE e.client_id = c.id
  AND (e.participant_name IS NULL OR e.participant_email IS NULL OR e.participant_phone IS NULL);

UPDATE public.surf_camp_enrollments
SET participant_name = COALESCE(participant_name, 'Guest')
WHERE participant_name IS NULL;

UPDATE public.surf_camp_enrollments
SET participant_email = COALESCE(participant_email, '')
WHERE participant_email IS NULL;

-- 4) participant_name/email should be present (production expects this)
ALTER TABLE public.surf_camp_enrollments
  ALTER COLUMN participant_name SET NOT NULL,
  ALTER COLUMN participant_email SET NOT NULL;

-- 5) Align FK: allow client deletion without breaking enrollments
-- (requires client_id nullable)
ALTER TABLE public.surf_camp_enrollments
  ALTER COLUMN client_id DROP NOT NULL;

DO $$
DECLARE
  fk record;
BEGIN
  FOR fk IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.surf_camp_enrollments'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) ILIKE '%FOREIGN KEY (client_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.surf_camp_enrollments DROP CONSTRAINT IF EXISTS %I', fk.conname);
  END LOOP;
END $$;

ALTER TABLE public.surf_camp_enrollments
  ADD CONSTRAINT surf_camp_enrollments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- 6) Expand allowed statuses and payment statuses if constraints exist
DO $$
DECLARE
  chk record;
BEGIN
  FOR chk IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.surf_camp_enrollments'::regclass
      AND contype = 'c'
      AND conname ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.surf_camp_enrollments DROP CONSTRAINT IF EXISTS %I', chk.conname);
  END LOOP;
END $$;

ALTER TABLE public.surf_camp_enrollments
  ADD CONSTRAINT surf_camp_enrollments_status_check
  CHECK ((status)::text = ANY ((ARRAY['pending','confirmed','cancelled','enrolled'])::text[]));

DO $$
DECLARE
  chk record;
BEGIN
  FOR chk IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.surf_camp_enrollments'::regclass
      AND contype = 'c'
      AND conname ILIKE '%payment_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.surf_camp_enrollments DROP CONSTRAINT IF EXISTS %I', chk.conname);
  END LOOP;
END $$;

ALTER TABLE public.surf_camp_enrollments
  ADD CONSTRAINT surf_camp_enrollments_payment_status_check
  CHECK (payment_status IS NULL OR (payment_status)::text = ANY ((ARRAY['pending','paid','refunded'])::text[]));

COMMIT;

