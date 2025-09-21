-- RPC function to get available beds for a camp week with date range
-- This function calculates real-time availability considering existing bookings

CREATE OR REPLACE FUNCTION get_available_beds(
    p_camp_week_id UUID,
    p_check_in_date DATE DEFAULT NULL,
    p_check_out_date DATE DEFAULT NULL
)
RETURNS TABLE (
    bed_id UUID,
    room_id UUID,
    room_name TEXT,
    bed_name TEXT,
    bed_type TEXT,
    price_modifier DECIMAL(10,2),
    is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_camp_week_record RECORD;
    v_check_in DATE;
    v_check_out DATE;
    v_nights INTEGER;
BEGIN
    -- Get camp week details
    SELECT * INTO v_camp_week_record
    FROM camp_week
    WHERE id = p_camp_week_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Camp week not found or inactive';
    END IF;

    -- Determine date range
    v_check_in := COALESCE(p_check_in_date, v_camp_week_record.start_date);
    v_check_out := COALESCE(p_check_out_date, v_camp_week_record.end_date);

    -- Validate date range is within camp week
    IF v_check_in < v_camp_week_record.start_date OR v_check_out > v_camp_week_record.end_date THEN
        RAISE EXCEPTION 'Requested dates must be within camp week range';
    END IF;

    -- Calculate number of nights
    v_nights := v_check_out - v_check_in;

    -- Return bed availability
    RETURN QUERY
    SELECT
        b.id as bed_id,
        r.id as room_id,
        r.name as room_name,
        b.name as bed_name,
        b.bed_type::TEXT,
        b.price_modifier,
        CASE
            WHEN EXISTS (
                SELECT 1 FROM booking_bed bb
                JOIN bookings bk ON bb.booking_id = bk.id
                WHERE bb.bed_id = b.id
                AND bk.camp_week_id = p_camp_week_id
                AND bk.status NOT IN ('cancelled')
                -- Check for date overlap
                AND (
                    (bk.check_in_date <= v_check_out AND bk.check_out_date >= v_check_in)
                    OR (bk.check_in_date IS NULL AND bk.check_out_date IS NULL) -- Full camp week booking
                )
            ) THEN false
            ELSE true
        END as is_available
    FROM bed b
    JOIN room r ON b.room_id = r.id
    JOIN property p ON r.property_id = p.id
    WHERE r.is_active = true
    AND b.is_active = true
    AND p.is_active = true
    ORDER BY r.name, b.name;
END;
$$;

-- Grant execute permission to authenticated users (needed for widget)
GRANT EXECUTE ON FUNCTION get_available_beds(UUID, DATE, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_available_beds(UUID, DATE, DATE) IS
'Returns available beds for a camp week within specified date range.
Returns bed details with availability status considering existing bookings.';
