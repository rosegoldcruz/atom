-- =====================================================
-- ATOM ARBITRAGE SYSTEM - TRIGGERS & FUNCTIONS
-- =====================================================
-- Purpose: Database functions, triggers, and automation
-- Version: 1.0.0
-- Created: 2025-01-16
-- Following AEON platform standards and Vercel best practices

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to clean expired opportunities
CREATE OR REPLACE FUNCTION clean_expired_opportunities()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.arbitrage_opportunities 
    WHERE status = 'detected' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup
    INSERT INTO public.system_logs (level, component, message, details)
    VALUES ('info', 'cleanup', 'Cleaned expired opportunities', 
            jsonb_build_object('deleted_count', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old notifications
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup
    INSERT INTO public.system_logs (level, component, message, details)
    VALUES ('info', 'cleanup', 'Cleaned old notifications', 
            jsonb_build_object('deleted_count', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default configuration for new users
CREATE OR REPLACE FUNCTION public.create_default_config()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.arbitrage_config (user_id, name, enabled_tokens, enabled_dexes)
  VALUES (
    NEW.id, 
    'Default Configuration',
    ARRAY['0x4200000000000000000000000000000000000006', '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'], -- WETH, USDC on Base
    ARRAY['uniswap_v2', 'uniswap_v3', 'balancer']
  );
  
  -- Create initial bot status
  INSERT INTO public.bot_status (config_id, status)
  SELECT id, 'stopped' FROM public.arbitrage_config WHERE user_id = NEW.id;
  
  -- Send welcome notification
  INSERT INTO public.notifications (user_id, type, title, message, priority)
  VALUES (
    NEW.id,
    'system_info',
    'Welcome to ATOM!',
    'Your account has been created successfully. Start by configuring your arbitrage settings.',
    'normal'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_trades BIGINT,
  successful_trades BIGINT,
  total_profit DECIMAL(18,8),
  total_profit_usd DECIMAL(18,2),
  success_rate DECIMAL(5,2),
  avg_profit_per_trade DECIMAL(18,8),
  total_gas_used BIGINT,
  avg_gas_per_trade DECIMAL(10,2),
  best_trade_profit DECIMAL(18,8),
  worst_trade_profit DECIMAL(18,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_trades,
    COUNT(CASE WHEN status = 'success' THEN 1 END)::BIGINT as successful_trades,
    COALESCE(SUM(profit), 0) as total_profit,
    COALESCE(SUM(profit_usd), 0) as total_profit_usd,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN status = 'success' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
      ELSE 0 
    END as success_rate,
    CASE 
      WHEN COUNT(CASE WHEN status = 'success' THEN 1 END) > 0 THEN 
        COALESCE(SUM(profit), 0) / COUNT(CASE WHEN status = 'success' THEN 1 END)
      ELSE 0 
    END as avg_profit_per_trade,
    COALESCE(SUM(gas_used), 0) as total_gas_used,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        COALESCE(AVG(gas_used), 0)
      ELSE 0 
    END as avg_gas_per_trade,
    COALESCE(MAX(profit), 0) as best_trade_profit,
    COALESCE(MIN(profit), 0) as worst_trade_profit
  FROM public.arbitrage_trades 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent opportunities
CREATE OR REPLACE FUNCTION public.get_recent_opportunities(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  token_in TEXT,
  token_out TEXT,
  token_in_symbol TEXT,
  token_out_symbol TEXT,
  amount_in DECIMAL(18,8),
  dex_buy TEXT,
  dex_sell TEXT,
  estimated_profit DECIMAL(18,8),
  profit_basis_points INTEGER,
  status TEXT,
  detected_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.token_in,
    o.token_out,
    o.token_in_symbol,
    o.token_out_symbol,
    o.amount_in,
    o.dex_buy,
    o.dex_sell,
    o.estimated_profit,
    o.profit_basis_points,
    o.status,
    o.detected_at,
    o.executed_at
  FROM public.arbitrage_opportunities o
  JOIN public.arbitrage_config c ON o.config_id = c.id
  WHERE c.user_id = user_uuid
  ORDER BY o.detected_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily profit summary
CREATE OR REPLACE FUNCTION public.get_daily_profit_summary(
  user_uuid UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_profit DECIMAL(18,8),
  total_profit_usd DECIMAL(18,2),
  trade_count BIGINT,
  success_count BIGINT,
  avg_profit DECIMAL(18,8),
  gas_cost DECIMAL(18,8)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(t.executed_at) as date,
    SUM(CASE WHEN t.status = 'success' THEN t.profit ELSE 0 END) as total_profit,
    SUM(CASE WHEN t.status = 'success' THEN t.profit_usd ELSE 0 END) as total_profit_usd,
    COUNT(*)::BIGINT as trade_count,
    COUNT(CASE WHEN t.status = 'success' THEN 1 END)::BIGINT as success_count,
    AVG(CASE WHEN t.status = 'success' THEN t.profit ELSE NULL END) as avg_profit,
    SUM(COALESCE(t.gas_cost_eth, 0)) as gas_cost
  FROM public.arbitrage_trades t
  WHERE t.user_id = user_uuid 
    AND t.executed_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY DATE(t.executed_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- OPERATIONAL FUNCTIONS
-- =====================================================

-- Function to update bot status
CREATE OR REPLACE FUNCTION public.update_bot_status(
  config_uuid UUID,
  new_status TEXT,
  error_msg TEXT DEFAULT NULL,
  metadata_json JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.bot_status (config_id, status, error_message, metadata, updated_at)
  VALUES (config_uuid, new_status, error_msg, COALESCE(metadata_json, '{}'::jsonb), NOW())
  ON CONFLICT (config_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at,
    error_count = CASE 
      WHEN EXCLUDED.error_message IS NOT NULL THEN bot_status.error_count + 1
      ELSE bot_status.error_count
    END,
    last_error_at = CASE 
      WHEN EXCLUDED.error_message IS NOT NULL THEN NOW()
      ELSE bot_status.last_error_at
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system events
CREATE OR REPLACE FUNCTION public.log_system_event(
  log_level TEXT,
  component_name TEXT,
  log_message TEXT,
  log_details JSONB DEFAULT NULL,
  user_uuid UUID DEFAULT NULL,
  trade_uuid UUID DEFAULT NULL,
  opportunity_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.system_logs (level, component, message, details, user_id, trade_id, opportunity_id)
  VALUES (log_level, component_name, log_message, COALESCE(log_details, '{}'::jsonb), user_uuid, trade_uuid, opportunity_uuid)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  user_uuid UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  notification_priority TEXT DEFAULT 'normal',
  notification_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, priority, data)
  VALUES (user_uuid, notification_type, notification_title, notification_message, notification_priority, COALESCE(notification_data, '{}'::jsonb))
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arbitrage_config_updated_at
  BEFORE UPDATE ON public.arbitrage_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bot_status_updated_at
  BEFORE UPDATE ON public.bot_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User creation triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_user_created_config
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_config();

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant function permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_opportunities(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_profit_summary(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_system_event(TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- Service role permissions for bot operations
GRANT EXECUTE ON FUNCTION public.update_bot_status(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION clean_expired_opportunities() TO service_role;
GRANT EXECUTE ON FUNCTION clean_old_notifications() TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
