-- 🔐 CRITICAL SECURITY MIGRATION
-- Date: 2025-01-16
-- Purpose: Implement Row Level Security and performance optimizations

-- 🛡️ ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitrage_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitrage_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE arbitrage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;

-- 🔒 CREATE SECURITY POLICIES

-- Users can only see their own data
CREATE POLICY "Users can only access their own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Users can only see their own trades
CREATE POLICY "Users can only access their own trades" ON arbitrage_trades
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own opportunities
CREATE POLICY "Users can only access their own opportunities" ON arbitrage_opportunities
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own config
CREATE POLICY "Users can only access their own config" ON arbitrage_config
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own bot status
CREATE POLICY "Users can only access their own bot status" ON bot_status
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own activity
CREATE POLICY "Users can only access their own activity" ON recent_activity
  FOR ALL USING (auth.uid() = user_id);

-- System logs are admin-only
CREATE POLICY "Only admins can access system logs" ON system_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- 📊 PERFORMANCE INDEXES

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Trade-related indexes
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON arbitrage_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON arbitrage_trades(created_at);
CREATE INDEX IF NOT EXISTS idx_trades_profit ON arbitrage_trades(profit_usd);
CREATE INDEX IF NOT EXISTS idx_trades_status ON arbitrage_trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_network ON arbitrage_trades(network);

-- Opportunity-related indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON arbitrage_opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_profit ON arbitrage_opportunities(profit_usd);
CREATE INDEX IF NOT EXISTS idx_opportunities_timestamp ON arbitrage_opportunities(detected_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON arbitrage_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_network ON arbitrage_opportunities(network);

-- Config-related indexes
CREATE INDEX IF NOT EXISTS idx_config_user_id ON arbitrage_config(user_id);
CREATE INDEX IF NOT EXISTS idx_config_active ON arbitrage_config(is_active);

-- Bot status indexes
CREATE INDEX IF NOT EXISTS idx_bot_status_user_id ON bot_status(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_status_timestamp ON bot_status(updated_at);

-- Activity indexes
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON recent_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON recent_activity(timestamp);

-- System logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_component ON system_logs(component);

-- 🔐 SECURITY FUNCTIONS

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 📈 PERFORMANCE VIEWS

-- User dashboard summary view
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  COUNT(DISTINCT at.id) as total_trades,
  COALESCE(SUM(at.profit_usd), 0) as total_profit,
  COUNT(DISTINCT ao.id) as total_opportunities,
  MAX(at.created_at) as last_trade_date,
  bs.status as bot_status,
  bs.updated_at as bot_last_update
FROM users u
LEFT JOIN arbitrage_trades at ON u.id = at.user_id
LEFT JOIN arbitrage_opportunities ao ON u.id = ao.user_id
LEFT JOIN bot_status bs ON u.id = bs.user_id
GROUP BY u.id, u.email, u.name, bs.status, bs.updated_at;

-- Recent activity summary view
CREATE OR REPLACE VIEW recent_activity_summary AS
SELECT 
  ra.user_id,
  ra.activity_type,
  ra.description,
  ra.timestamp,
  u.email as user_email
FROM recent_activity ra
JOIN users u ON ra.user_id = u.id
WHERE ra.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY ra.timestamp DESC;

-- 🔒 ADDITIONAL SECURITY CONSTRAINTS

-- Ensure email uniqueness
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Ensure positive profit values where applicable
ALTER TABLE arbitrage_trades ADD CONSTRAINT positive_profit 
  CHECK (profit_usd >= -1000000); -- Allow losses up to $1M

-- Ensure valid timestamps
ALTER TABLE arbitrage_trades ADD CONSTRAINT valid_trade_timestamp 
  CHECK (created_at <= NOW());

ALTER TABLE arbitrage_opportunities ADD CONSTRAINT valid_opportunity_timestamp 
  CHECK (detected_at <= NOW());

-- Ensure valid status values
ALTER TABLE arbitrage_trades ADD CONSTRAINT valid_trade_status 
  CHECK (status IN ('pending', 'executed', 'failed', 'cancelled'));

ALTER TABLE arbitrage_opportunities ADD CONSTRAINT valid_opportunity_status 
  CHECK (status IN ('detected', 'executing', 'executed', 'expired', 'failed'));

-- 📝 AUDIT LOGGING

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can see audit logs
CREATE POLICY "Only admins can access audit logs" ON audit_logs
  FOR ALL USING (is_admin(auth.uid()));

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_trades_trigger
  AFTER INSERT OR UPDATE OR DELETE ON arbitrage_trades
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 🎯 GRANT APPROPRIATE PERMISSIONS

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON arbitrage_trades TO authenticated;
GRANT SELECT, INSERT, UPDATE ON arbitrage_opportunities TO authenticated;
GRANT SELECT, INSERT, UPDATE ON arbitrage_config TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bot_status TO authenticated;
GRANT SELECT, INSERT, UPDATE ON recent_activity TO authenticated;

-- Grant read access to views
GRANT SELECT ON user_dashboard_summary TO authenticated;
GRANT SELECT ON recent_activity_summary TO authenticated;

-- Only service role can access system logs
GRANT ALL ON system_logs TO service_role;
GRANT ALL ON audit_logs TO service_role;

COMMENT ON MIGRATION IS 'Critical security migration implementing RLS, indexes, and audit logging';
