-- RPC function to validate promo codes with usage tracking
-- Handles promo code validation, usage limits, and discount calculation

CREATE OR REPLACE FUNCTION validate_promo_code(
    p_code TEXT,
    p_brand_id UUID,
    p_booking_amount DECIMAL(10,2) DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo_record RECORD;
    v_discount_amount DECIMAL(10,2) := 0;
    v_result JSONB;
BEGIN
    -- Find active promo code
    SELECT * INTO v_promo_record
    FROM promo_code
    WHERE code = UPPER(TRIM(p_code))
    AND brand_id = p_brand_id
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND (max_uses IS NULL OR used_count < max_uses);

    IF NOT FOUND THEN
        RETURN JSONB_BUILD_OBJECT(
            'valid', false,
            'error', 'Promo code not found or expired'
        );
    END IF;

    -- Check minimum amount requirement
    IF p_booking_amount > 0 AND p_booking_amount < v_promo_record.minimum_amount THEN
        RETURN JSONB_BUILD_OBJECT(
            'valid', false,
            'error', FORMAT('Minimum purchase amount is $%s', v_promo_record.minimum_amount)
        );
    END IF;

    -- Calculate discount amount
    IF v_promo_record.discount_type = 'percentage' THEN
        v_discount_amount := p_booking_amount * (v_promo_record.discount_value / 100);
    ELSE -- fixed amount
        v_discount_amount := LEAST(v_promo_record.discount_value, p_booking_amount);
    END IF;

    -- Build successful result
    v_result := JSONB_BUILD_OBJECT(
        'valid', true,
        'code', v_promo_record.code,
        'description', v_promo_record.description,
        'discount_type', v_promo_record.discount_type,
        'discount_value', v_promo_record.discount_value,
        'discount_amount', v_discount_amount,
        'minimum_amount', v_promo_record.minimum_amount,
        'remaining_uses', CASE
            WHEN v_promo_record.max_uses IS NULL THEN NULL
            ELSE v_promo_record.max_uses - v_promo_record.used_count
        END,
        'expires_at', v_promo_record.valid_until,
        'brand_id', v_promo_record.brand_id
    );

    RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users (needed for checkout)
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, DECIMAL) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION validate_promo_code(TEXT, UUID, DECIMAL) IS
'Validates promo code and calculates discount amount.
Returns validation status with discount details or error message.';
