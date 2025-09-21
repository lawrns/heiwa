-- RPC function to get property-level availability aggregation
-- Returns availability summary for all camp weeks in a property

CREATE OR REPLACE FUNCTION get_property_availability(
    p_property_id UUID,
    p_check_in_date DATE DEFAULT CURRENT_DATE,
    p_check_out_date DATE DEFAULT NULL
)
RETURNS TABLE (
    camp_week_id UUID,
    camp_week_name TEXT,
    start_date DATE,
    end_date DATE,
    base_price DECIMAL(10,2),
    capacity INTEGER,
    booked_count INTEGER,
    available_beds INTEGER,
    available_capacity INTEGER,
    is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_check_out DATE;
BEGIN
    -- Default check-out to 7 days after check-in if not specified
    v_check_out := COALESCE(p_check_out_date, p_check_in_date + INTERVAL '7 days');

    -- Validate property exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM property
        WHERE id = p_property_id AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Property not found or inactive';
    END IF;

    -- Return availability for all active camp weeks in the property
    RETURN QUERY
    SELECT
        cw.id as camp_week_id,
        cw.name as camp_week_name,
        cw.start_date,
        cw.end_date,
        cw.base_price,
        cw.capacity,
        cw.booked_count,
        -- Calculate available beds considering the requested date range
        GREATEST(0, cw.capacity - cw.booked_count) as available_beds,
        -- Calculate available capacity for the date range
        CASE
            WHEN p_check_in_date >= cw.start_date AND v_check_out <= cw.end_date THEN
                GREATEST(0, cw.capacity - (
                    SELECT COUNT(DISTINCT bb.bed_id)
                    FROM booking_bed bb
                    JOIN bookings b ON bb.booking_id = b.id
                    WHERE b.camp_week_id = cw.id
                    AND b.status NOT IN ('cancelled')
                    AND (
                        (b.check_in_date <= v_check_out AND b.check_out_date >= p_check_in_date)
                        OR (b.check_in_date IS NULL AND b.check_out_date IS NULL)
                    )
                ))
            ELSE 0
        END as available_capacity,
        -- Overall availability flag
        CASE
            WHEN p_check_in_date >= cw.start_date AND v_check_out <= cw.end_date THEN
                CASE WHEN GREATEST(0, cw.capacity - cw.booked_count) > 0 THEN true ELSE false END
            ELSE false
        END as is_available
    FROM camp_week cw
    WHERE cw.property_id = p_property_id
    AND cw.is_active = true
    AND cw.start_date <= v_check_out
    AND cw.end_date >= p_check_in_date
    ORDER BY cw.start_date;
END;
$$;

-- Grant execute permission to authenticated users (needed for widget)
GRANT EXECUTE ON FUNCTION get_property_availability(UUID, DATE, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_property_availability(UUID, DATE, DATE) IS
'Returns availability summary for all camp weeks in a property within specified date range.
Aggregates bed availability and booking status for quick property-level availability checks.';
