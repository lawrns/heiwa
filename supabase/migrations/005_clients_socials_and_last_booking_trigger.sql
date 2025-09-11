-- 005_clients_socials_and_last_booking_trigger.sql
-- Adds clients.socials JSONB and a trigger to auto-update last_booking_date from bookings

BEGIN;

-- 1) Add socials column to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS socials JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2) Trigger function to update clients.last_booking_date when bookings change
CREATE OR REPLACE FUNCTION public.update_clients_last_booking_date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  cid UUID;
BEGIN
  IF NEW.client_ids IS NULL THEN
    RETURN NEW;
  END IF;

  FOREACH cid IN ARRAY NEW.client_ids LOOP
    UPDATE public.clients
    SET last_booking_date = GREATEST(
          COALESCE(last_booking_date, TIMESTAMPTZ '-infinity'),
          COALESCE(NEW.updated_at, NOW())
        ),
        updated_at = NOW()
    WHERE id = cid;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 3) Trigger on bookings insert/update
DROP TRIGGER IF EXISTS trg_bookings_update_clients_last_booking ON public.bookings;
CREATE TRIGGER trg_bookings_update_clients_last_booking
AFTER INSERT OR UPDATE OF items, updated_at ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_clients_last_booking_date();

COMMIT;

