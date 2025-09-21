-- RPC function to calculate complex booking pricing
-- Handles base rates, addons, promo codes, taxes, and modifiers

CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_brand_id UUID,
    p_camp_week_id UUID,
    p_bed_ids UUID[],
    p_addon_quantities JSONB DEFAULT '{}',
    p_promo_code TEXT DEFAULT NULL,
    p_check_in_date DATE DEFAULT NULL,
    p_check_out_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB := '{}';
    v_camp_week RECORD;
    v_brand RECORD;
    v_base_price DECIMAL(10,2) := 0;
    v_bed_total DECIMAL(10,2) := 0;
    v_addon_total DECIMAL(10,2) := 0;
    v_discount_amount DECIMAL(10,2) := 0;
    v_tax_amount DECIMAL(10,2) := 0;
    v_nights INTEGER;
    v_guest_count INTEGER;
    v_promo_details JSONB;
    v_addon_details JSONB := '[]';
BEGIN
    -- Get camp week and brand details
    SELECT * INTO v_camp_week
    FROM camp_week cw
    JOIN property p ON cw.property_id = p.id
    WHERE cw.id = p_camp_week_id AND cw.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Camp week not found or inactive';
    END IF;

    SELECT * INTO v_brand
    FROM brand
    WHERE id = p_brand_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Brand not found or inactive';
    END IF;

    -- Calculate date range and nights
    v_nights := COALESCE(p_check_out_date, v_camp_week.end_date) -
                COALESCE(p_check_in_date, v_camp_week.start_date);

    -- Calculate guest count from beds
    SELECT COUNT(*) INTO v_guest_count
    FROM bed
    WHERE id = ANY(p_bed_ids) AND is_active = true;

    IF v_guest_count = 0 THEN
        RAISE EXCEPTION 'No valid beds selected';
    END IF;

    -- Calculate bed pricing
    SELECT SUM(
        CASE
            WHEN b.price_modifier IS NOT NULL THEN
                v_camp_week.base_price + b.price_modifier
            ELSE v_camp_week.base_price
        END * v_nights
    ) INTO v_bed_total
    FROM bed b
    WHERE b.id = ANY(p_bed_ids) AND b.is_active = true;

    -- Calculate addon pricing
    SELECT
        COALESCE(SUM(a.price * (p_addon_quantities->>a.id::TEXT)::INTEGER), 0),
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'addon_id', a.id,
                'name', a.name,
                'quantity', (p_addon_quantities->>a.id::TEXT)::INTEGER,
                'unit_price', a.price,
                'total', a.price * (p_addon_quantities->>a.id::TEXT)::INTEGER
            )
        ) FILTER (WHERE p_addon_quantities ? a.id::TEXT)
    INTO v_addon_total, v_addon_details
    FROM addon a
    WHERE a.is_active = true;

    -- Calculate subtotal
    v_base_price := v_bed_total + v_addon_total;

    -- Apply promo code if provided
    IF p_promo_code IS NOT NULL THEN
        SELECT
            JSONB_BUILD_OBJECT(
                'code', pc.code,
                'type', pc.discount_type,
                'value', pc.discount_value,
                'discount_amount',
                CASE pc.discount_type
                    WHEN 'percentage' THEN v_base_price * (pc.discount_value / 100)
                    WHEN 'fixed' THEN LEAST(pc.discount_value, v_base_price)
                END
            )
        INTO v_promo_details
        FROM promo_code pc
        WHERE pc.code = UPPER(TRIM(p_promo_code))
        AND pc.brand_id = p_brand_id
        AND pc.is_active = true
        AND (pc.valid_from IS NULL OR pc.valid_from <= CURRENT_DATE)
        AND (pc.valid_until IS NULL OR pc.valid_until >= CURRENT_DATE)
        AND pc.used_count < pc.max_uses
        AND v_base_price >= pc.minimum_amount;

        IF v_promo_details IS NOT NULL THEN
            v_discount_amount := (v_promo_details->>'discount_amount')::DECIMAL(10,2);
        END IF;
    END IF;

    -- Calculate taxes (simplified - in real implementation, this would be more complex)
    -- Assuming 10% tax rate for this example
    v_tax_amount := (v_base_price - v_discount_amount) * 0.10;

    -- Build result
    v_result := JSONB_BUILD_OBJECT(
        'camp_week_id', p_camp_week_id,
        'brand_id', p_brand_id,
        'guest_count', v_guest_count,
        'nights', v_nights,
        'check_in_date', COALESCE(p_check_in_date, v_camp_week.start_date),
        'check_out_date', COALESCE(p_check_out_date, v_camp_week.end_date),
        'pricing', JSONB_BUILD_OBJECT(
            'base_price', v_base_price,
            'bed_total', v_bed_total,
            'addon_total', v_addon_total,
            'discount_amount', v_discount_amount,
            'tax_amount', v_tax_amount,
            'grand_total', v_base_price - v_discount_amount + v_tax_amount,
            'currency', 'USD'
        ),
        'promo_applied', v_promo_details,
        'addons', v_addon_details,
        'beds_selected', p_bed_ids,
        'calculated_at', CURRENT_TIMESTAMP,
        'valid_for_minutes', 30
    );

    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_booking_price(UUID, UUID, UUID[], JSONB, TEXT, DATE, DATE) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION calculate_booking_price(UUID, UUID, UUID[], JSONB, TEXT, DATE, DATE) IS
'Calculates comprehensive booking price including beds, addons, promo codes, and taxes.
Returns detailed pricing breakdown with 30-minute validity period.';
