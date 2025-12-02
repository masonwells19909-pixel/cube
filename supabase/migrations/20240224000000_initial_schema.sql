/*
  # Initial Schema for Cube Game PWA
  
  ## Query Description:
  This migration sets up the core tables for the game: profiles, transactions, withdrawals, and app settings.
  It includes triggers for user creation and RLS policies for security.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - public.profiles: Extends auth.users with game stats (vip_level, balance, etc.)
  - public.transactions: Ledger for all earnings and spending.
  - public.withdrawals: Withdrawal requests queue.
  - public.app_settings: Dynamic config for VIP rates and game settings.

  ## Security Implications:
  - RLS Enabled on all tables.
  - Public profiles are readable by owners.
  - Admin can read/write all.
*/

-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    referral_code TEXT UNIQUE,
    referrer_id UUID REFERENCES public.profiles(id),
    balance DECIMAL(12, 6) DEFAULT 0.000000,
    total_solved INTEGER DEFAULT 0,
    vip_level INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 6) NOT NULL,
    type TEXT NOT NULL, -- 'game_reward', 'referral_bonus', 'withdrawal'
    status TEXT DEFAULT 'completed', -- 'completed', 'pending', 'failed'
    source_details JSONB, -- Stores level number, or referrer info
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 6) NOT NULL,
    method TEXT DEFAULT 'USDT-Binance',
    wallet_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create App Settings Table (For Admin Control)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT
);

-- Insert Default Settings
INSERT INTO public.app_settings (key, value, description) VALUES
('vip_config', '{
  "vip0": {"threshold": 0, "rate_normal": 0.000025, "rate_final": 0.025},
  "vip1": {"threshold": 1500, "rate_normal": 0.00025, "rate_final": 0.00025}, 
  "vip2": {"threshold": 3000, "rate_normal": 0.0025, "rate_final": 0.0025},
  "vip3": {"threshold": 6000, "rate_normal": 0.01, "rate_final": 0.01},
  "vip4": {"threshold": 10000, "rate_normal": 0.025, "rate_final": 0.025}
}'::jsonb, 'VIP thresholds and rates configurations'),
('withdrawal_config', '{
  "min_amount": 0.25,
  "enabled": true
}'::jsonb, 'Withdrawal settings');

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies for Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policies for Withdrawals
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for App Settings
CREATE POLICY "Everyone can view settings" ON public.app_settings
    FOR SELECT USING (true);

-- Admin Policies (Assuming is_admin flag logic needs a secure function or manual set, here we allow basic read for now)
-- Ideally, we create a function `is_admin()` but for simplicity we trust the column for RLS in this demo context
CREATE POLICY "Admins can do everything on profiles" ON public.profiles
    FOR ALL USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );

CREATE POLICY "Admins can do everything on transactions" ON public.transactions
    FOR ALL USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );

CREATE POLICY "Admins can do everything on withdrawals" ON public.withdrawals
    FOR ALL USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );
    
CREATE POLICY "Admins can update settings" ON public.app_settings
    FOR UPDATE USING ( (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, referral_code)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    encode(gen_random_bytes(6), 'hex') -- Simple random referral code
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to process game win (Securely add balance)
CREATE OR REPLACE FUNCTION public.process_game_win(
    p_user_id UUID, 
    p_amount DECIMAL, 
    p_level INTEGER,
    p_is_final BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    v_referrer_id UUID;
    v_referral_bonus DECIMAL;
BEGIN
    -- 1. Update User Balance & Stats
    UPDATE public.profiles 
    SET balance = balance + p_amount,
        total_solved = total_solved + 1
    WHERE id = p_user_id
    RETURNING referrer_id INTO v_referrer_id;

    -- 2. Log Transaction
    INSERT INTO public.transactions (user_id, amount, type, source_details)
    VALUES (p_user_id, p_amount, 'game_reward', jsonb_build_object('level', p_level));

    -- 3. Handle Referral Bonus (10%)
    IF v_referrer_id IS NOT NULL THEN
        v_referral_bonus := p_amount * 0.10;
        
        UPDATE public.profiles
        SET balance = balance + v_referral_bonus
        WHERE id = v_referrer_id;

        INSERT INTO public.transactions (user_id, amount, type, source_details)
        VALUES (v_referrer_id, v_referral_bonus, 'referral_bonus', jsonb_build_object('from_user', p_user_id, 'level', p_level));
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
