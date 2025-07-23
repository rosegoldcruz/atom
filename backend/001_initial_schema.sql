-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'trader', 'viewer');
CREATE TYPE bot_status AS ENUM ('idle', 'running', 'paused', 'error');
CREATE TYPE trade_status AS ENUM ('pending', 'executing', 'completed', 'failed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    api_key TEXT UNIQUE,
    max_daily_trades INTEGER DEFAULT 100,
    max_position_size DECIMAL DEFAULT 1000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot configurations per user
CREATE TABLE public.bot_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status bot_status DEFAULT 'idle',
    network TEXT NOT NULL,
    max_position_size DECIMAL NOT NULL DEFAULT 100.00,
    min_profit_threshold DECIMAL NOT NULL DEFAULT 10.00,
    risk_tolerance DECIMAL NOT NULL DEFAULT 0.3,
    auto_execute BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arbitrage opportunities
CREATE TABLE public.opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    network TEXT NOT NULL,
    pair TEXT NOT NULL,
    token_a TEXT NOT NULL,
    token_b TEXT NOT NULL,
    buy_exchange TEXT NOT NULL,
    sell_exchange TEXT NOT NULL,
    buy_price DECIMAL NOT NULL,
    sell_price DECIMAL NOT NULL,
    profit_usd DECIMAL NOT NULL,
    profit_percent DECIMAL NOT NULL,
    volume DECIMAL NOT NULL,
    gas_estimate INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade executions
CREATE TABLE public.trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES public.opportunities(id),
    bot_config_id UUID REFERENCES public.bot_configs(id),
    network TEXT NOT NULL,
    pair TEXT NOT NULL,
    status trade_status DEFAULT 'pending',
    amount_in DECIMAL NOT NULL,
    amount_out DECIMAL,
    profit_usd DECIMAL,
    gas_used INTEGER,
    gas_price DECIMAL,
    tx_hash TEXT,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_api_key ON public.user_profiles(api_key);
CREATE INDEX idx_bot_configs_user_id ON public.bot_configs(user_id);
CREATE INDEX idx_opportunities_user_id ON public.opportunities(user_id);
CREATE INDEX idx_opportunities_network ON public.opportunities(network);
CREATE INDEX idx_opportunities_created_at ON public.opportunities(created_at);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_trades_created_at ON public.trades(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policies for bot_configs
CREATE POLICY "Users can manage own bot configs" ON public.bot_configs
    FOR ALL USING (auth.uid() = user_id);

-- Policies for opportunities
CREATE POLICY "Users can view own opportunities" ON public.opportunities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create opportunities" ON public.opportunities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for trades
CREATE POLICY "Users can view own trades" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trades" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policies for api_usage
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate API keys
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ak_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user API key
CREATE OR REPLACE FUNCTION public.regenerate_api_key(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    new_key TEXT;
BEGIN
    new_key := public.generate_api_key();
    UPDATE public.user_profiles 
    SET api_key = new_key, updated_at = NOW()
    WHERE id = user_uuid AND id = auth.uid();
    RETURN new_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
