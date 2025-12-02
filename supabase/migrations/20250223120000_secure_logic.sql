/*
  # Secure Withdrawal & Referral Logic
  
  ## Query Description:
  1. Adds a secure RPC function `request_withdrawal` to handle balance deduction atomically on the server.
  2. Adds a trigger to link new users to their referrers automatically upon sign-up.
  3. Fixes security advisories by setting `search_path`.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Secure Withdrawal Function
CREATE OR REPLACE FUNCTION request_withdrawal(
    p_amount DECIMAL,
    p_wallet_address TEXT,
    p_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_balance DECIMAL;
BEGIN
    -- Check balance
    SELECT balance INTO v_current_balance FROM profiles WHERE id = v_user_id;
    
    IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- Deduct balance
    UPDATE profiles 
    SET balance = balance - p_amount 
    WHERE id = v_user_id;

    -- Create withdrawal record
    INSERT INTO withdrawals (user_id, amount, wallet_address, method, status)
    VALUES (v_user_id, p_amount, p_wallet_address, p_method, 'pending');

    -- Log transaction
    INSERT INTO transactions (user_id, amount, type, status)
    VALUES (v_user_id, -p_amount, 'withdrawal', 'pending');

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 2. Handle New User Referral (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referrer_code TEXT;
    v_referrer_id UUID;
BEGIN
    -- Get referral code from metadata
    v_referrer_code := new.raw_user_meta_data->>'referral_code';
    
    IF v_referrer_code IS NOT NULL THEN
        -- Find referrer
        SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_referrer_code;
        
        IF v_referrer_id IS NOT NULL THEN
            -- Update the new profile with referrer_id
            -- Note: The profile is created by another trigger usually, so we update it here
            -- Wait a tiny bit or ensure this runs after profile creation. 
            -- Better approach: Update the profile that matches this user
            UPDATE public.profiles 
            SET referred_by = v_referrer_id 
            WHERE id = new.id;
        END IF;
    END IF;
    
    RETURN new;
END;
$$;

-- Trigger to run after user creation
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_referral();
