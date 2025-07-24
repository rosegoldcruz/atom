-- =====================================================
-- ATOM ARBITRAGE SYSTEM - ROW LEVEL SECURITY
-- =====================================================
-- Purpose: Implement comprehensive RLS policies for data security
-- Version: 1.0.0
-- Created: 2025-01-16
-- Following AEON platform standards and Vercel best practices

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all user-related tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arbitrage_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_status ENABLE ROW LEVEL SECURITY;

-- Price feeds are public read-only data
-- ALTER TABLE public.price_feeds ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER POLICIES
-- =====================================================

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Prevent users from inserting directly (handled by trigger)
CREATE POLICY "Prevent direct user insertion" 
  ON public.users FOR INSERT 
  WITH CHECK (false);

-- =====================================================
-- ARBITRAGE CONFIG POLICIES
-- =====================================================

-- Users can manage their own configurations
CREATE POLICY "Users can view own configs" 
  ON public.arbitrage_config FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own configs" 
  ON public.arbitrage_config FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs" 
  ON public.arbitrage_config FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs" 
  ON public.arbitrage_config FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- ARBITRAGE OPPORTUNITIES POLICIES
-- =====================================================

-- Users can view opportunities for their configs
CREATE POLICY "Users can view own opportunities" 
  ON public.arbitrage_opportunities FOR SELECT 
  USING (
    config_id IN (
      SELECT id FROM public.arbitrage_config 
      WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all opportunities
CREATE POLICY "Service role can manage opportunities" 
  ON public.arbitrage_opportunities FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- ARBITRAGE TRADES POLICIES
-- =====================================================

-- Users can view their own trades
CREATE POLICY "Users can view own trades" 
  ON public.arbitrage_trades FOR SELECT 
  USING (auth.uid() = user_id);

-- Service role can manage all trades
CREATE POLICY "Service role can manage trades" 
  ON public.arbitrage_trades FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- SYSTEM LOGS POLICIES
-- =====================================================

-- Users can view their own logs
CREATE POLICY "Users can view own logs" 
  ON public.system_logs FOR SELECT 
  USING (
    user_id = auth.uid() OR
    trade_id IN (
      SELECT id FROM public.arbitrage_trades 
      WHERE user_id = auth.uid()
    ) OR
    opportunity_id IN (
      SELECT o.id FROM public.arbitrage_opportunities o
      JOIN public.arbitrage_config c ON o.config_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Service role can manage all logs
CREATE POLICY "Service role can manage logs" 
  ON public.system_logs FOR ALL 
  USING (auth.role() = 'service_role');

-- Authenticated users can insert logs (for client-side logging)
CREATE POLICY "Authenticated users can insert logs" 
  ON public.system_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view and manage their own notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
  ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Service role can create notifications for users
CREATE POLICY "Service role can create notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- BOT STATUS POLICIES
-- =====================================================

-- Users can view bot status for their configs
CREATE POLICY "Users can view own bot status" 
  ON public.bot_status FOR SELECT 
  USING (
    config_id IN (
      SELECT id FROM public.arbitrage_config 
      WHERE user_id = auth.uid()
    )
  );

-- Service role can manage all bot status
CREATE POLICY "Service role can manage bot status" 
  ON public.bot_status FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- ADMIN POLICIES
-- =====================================================

-- Admin users can view all data (override other policies)
CREATE POLICY "Admins can view all users" 
  ON public.users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all configs" 
  ON public.arbitrage_config FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all opportunities" 
  ON public.arbitrage_opportunities FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all trades" 
  ON public.arbitrage_trades FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all logs" 
  ON public.system_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all notifications" 
  ON public.notifications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all bot status" 
  ON public.bot_status FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PRICE FEEDS POLICIES (PUBLIC READ-ONLY)
-- =====================================================

-- Everyone can read price feeds (market data)
CREATE POLICY "Anyone can view price feeds" 
  ON public.price_feeds FOR SELECT 
  USING (true);

-- Only service role can insert/update price feeds
CREATE POLICY "Service role can manage price feeds" 
  ON public.price_feeds FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns config
CREATE OR REPLACE FUNCTION public.user_owns_config(config_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.arbitrage_config 
    WHERE id = config_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier()
RETURNS TEXT AS $$
DECLARE
  tier TEXT;
BEGIN
  SELECT subscription_tier INTO tier
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_owns_config(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription_tier() TO authenticated;
