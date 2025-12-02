/*
  # Fix Signup Trigger and Profiles Schema
  
  ## Query Description:
  1. Ensures public.profiles table exists with all necessary columns.
  2. Replaces the handle_new_user trigger function with robust error handling.
  3. Ensures unique referral codes are generated.
  4. Links referrals correctly without crashing if the code is invalid.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High" (Fixes critical signup flow)
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Ensure Profiles Table Exists with Correct Structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    balance DECIMAL(16, 6) DEFAULT 0.0,
    vip_level INTEGER DEFAULT 0,
    total_solved INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies (Safe defaults)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Robust Function to Handle New Users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code text;
  v_referrer_id uuid;
  v_ref_code_from_meta text;
  v_full_name text;
BEGIN
  -- A. Generate a truly unique referral code (try up to 5 times to avoid collision)
  FOR i IN 1..5 LOOP
    v_referral_code := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_referral_code) THEN
      EXIT;
    END IF;
  END LOOP;

  -- B. Extract metadata safely
  BEGIN
    v_ref_code_from_meta := new.raw_user_meta_data->>'referral_code';
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  EXCEPTION WHEN OTHERS THEN
    v_full_name := 'User';
  END;

  -- C. Find Referrer (if code exists)
  IF v_ref_code_from_meta IS NOT NULL THEN
    SELECT id INTO v_referrer_id FROM public.profiles WHERE referral_code = v_ref_code_from_meta LIMIT 1;
  END IF;

  -- D. Insert Profile
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    referral_code,
    referred_by,
    balance,
    vip_level,
    total_solved,
    created_at
  ) VALUES (
    new.id,
    new.email,
    v_full_name,
    v_referral_code,
    v_referrer_id,
    0.0, -- Initial Balance
    0,   -- VIP 0
    0,   -- Solved 0
    now()
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error to Postgres logs (visible in Dashboard)
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  -- Do NOT block signup, but profile might be missing. 
  -- Alternatively, raise a clean error for the client:
  RAISE EXCEPTION 'System Error: Could not create profile. Details: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
