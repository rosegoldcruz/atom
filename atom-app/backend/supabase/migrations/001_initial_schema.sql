-- =====================================================
-- ATOM ARBITRAGE SYSTEM - INITIAL SCHEMA
-- =====================================================
-- Purpose: Core database schema for ATOM arbitrage platform
-- Version: 1.0.0
-- Created: 2025-01-16
-- Following AEON platform standards and Vercel best practices

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  wallet_address TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "telegram": false,
      "discord": false
    },
    "trading": {
      "auto_execute": false,
      "risk_level": "medium"
    },
    "ui": {
      "theme": "dark",
      "language": "en"
    }
  }'::jsonb
);

-- Arbitrage configuration table
CREATE TABLE public.arbitrage_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Profit settings
  min_profit_basis_points INTEGER NOT NULL DEFAULT 50, -- 0.5%
  max_slippage_basis_points INTEGER NOT NULL DEFAULT 300, -- 3%
  
  -- Gas settings
  max_gas_price_gwei INTEGER NOT NULL DEFAULT 50,
  gas_limit INTEGER NOT NULL DEFAULT 500000,
  
  -- Token and DEX settings
  enabled_tokens TEXT[] NOT NULL DEFAULT '{}',
  enabled_dexes TEXT[] NOT NULL DEFAULT '{"uniswap_v2", "uniswap_v3", "balancer"}',
  
  -- Flash loan settings
  flash_loan_enabled BOOLEAN NOT NULL DEFAULT true,
  preferred_flash_loan_provider TEXT DEFAULT 'aave',
  max_trade_amount_eth DECIMAL(18,8) NOT NULL DEFAULT 1.0,
  
  -- Risk management
  max_daily_trades INTEGER DEFAULT 100,
  max_daily_loss_eth DECIMAL(18,8) DEFAULT 0.1,
  stop_loss_enabled BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arbitrage opportunities table
CREATE TABLE public.arbitrage_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  
  -- Trade details
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  token_in_symbol TEXT,
  token_out_symbol TEXT,
  amount_in DECIMAL(18,8) NOT NULL,
  
  -- DEX information
  dex_buy TEXT NOT NULL,
  dex_sell TEXT NOT NULL,
  price_buy DECIMAL(18,8) NOT NULL,
  price_sell DECIMAL(18,8) NOT NULL,
  
  -- Profit calculations
  estimated_profit DECIMAL(18,8) NOT NULL,
  estimated_gas_cost DECIMAL(18,8) NOT NULL,
  profit_basis_points INTEGER NOT NULL,
  net_profit DECIMAL(18,8) GENERATED ALWAYS AS (estimated_profit - estimated_gas_cost) STORED,
  
  -- Execution status
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'analyzing', 'executing', 'completed', 'failed', 'expired')),
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 10),
  
  -- Timestamps
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  
  -- Blockchain data
  tx_hash TEXT,
  block_number BIGINT,
  actual_profit DECIMAL(18,8),
  actual_gas_used BIGINT,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Arbitrage trades table (executed trades)
CREATE TABLE public.arbitrage_trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id),
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Trade details
  token_in TEXT NOT NULL,
  token_out TEXT NOT NULL,
  token_in_symbol TEXT,
  token_out_symbol TEXT,
  amount_in DECIMAL(18,8) NOT NULL,
  amount_out DECIMAL(18,8),
  
  -- DEX path
  dex_path TEXT NOT NULL,
  route_details JSONB DEFAULT '{}'::jsonb,
  
  -- Flash loan details
  flash_loan_amount DECIMAL(18,8),
  flash_loan_premium DECIMAL(18,8),
  flash_loan_provider TEXT,
  
  -- Financial results
  profit DECIMAL(18,8) NOT NULL DEFAULT 0,
  profit_usd DECIMAL(18,2),
  gas_used BIGINT,
  gas_price_gwei INTEGER,
  gas_cost_eth DECIMAL(18,8),
  
  -- Blockchain data
  tx_hash TEXT UNIQUE,
  block_number BIGINT,
  block_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Status and timing
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'reverted')),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error handling
  error_message TEXT,
  error_code TEXT,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb
);

-- System logs table
CREATE TABLE public.system_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  component TEXT NOT NULL, -- 'orchestrator', 'contract', 'api', 'frontend', 'agent'
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Relations
  user_id UUID REFERENCES public.users(id),
  trade_id UUID REFERENCES public.arbitrage_trades(id),
  opportunity_id UUID REFERENCES public.arbitrage_opportunities(id),
  
  -- Metadata
  session_id TEXT,
  request_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price feeds table (for monitoring and analytics)
CREATE TABLE public.price_feeds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  dex TEXT NOT NULL,
  pair_address TEXT,
  
  -- Price data
  price DECIMAL(18,8) NOT NULL,
  price_usd DECIMAL(18,8),
  volume_24h DECIMAL(18,8),
  liquidity DECIMAL(18,8),
  
  -- Blockchain data
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  block_number BIGINT,
  
  -- Constraints
  UNIQUE(token_address, dex, timestamp)
);

-- Bot status table
CREATE TABLE public.bot_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  config_id UUID REFERENCES public.arbitrage_config(id) ON DELETE CASCADE,
  
  -- Status information
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'paused', 'error', 'maintenance')),
  health_score INTEGER DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
  
  -- Performance metrics
  last_scan_at TIMESTAMP WITH TIME ZONE,
  opportunities_found INTEGER DEFAULT 0,
  trades_executed INTEGER DEFAULT 0,
  total_profit DECIMAL(18,8) DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  
  -- Error information
  error_message TEXT,
  error_count INTEGER DEFAULT 0,
  last_error_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional data
  metadata JSONB DEFAULT '{
    "version": "1.0.0",
    "node_info": {},
    "performance": {}
  }'::jsonb,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one status per config
  UNIQUE(config_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('trade_success', 'trade_failed', 'high_profit', 'system_error', 'config_change', 'maintenance', 'security_alert')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Delivery status
  read BOOLEAN NOT NULL DEFAULT false,
  sent_email BOOLEAN NOT NULL DEFAULT false,
  sent_telegram BOOLEAN NOT NULL DEFAULT false,
  sent_discord BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);

-- Arbitrage opportunities indexes
CREATE INDEX idx_arbitrage_opportunities_status ON public.arbitrage_opportunities(status);
CREATE INDEX idx_arbitrage_opportunities_detected_at ON public.arbitrage_opportunities(detected_at);
CREATE INDEX idx_arbitrage_opportunities_token_pair ON public.arbitrage_opportunities(token_in, token_out);
CREATE INDEX idx_arbitrage_opportunities_profit ON public.arbitrage_opportunities(profit_basis_points DESC);
CREATE INDEX idx_arbitrage_opportunities_expires_at ON public.arbitrage_opportunities(expires_at);
CREATE INDEX idx_arbitrage_opportunities_config_status ON public.arbitrage_opportunities(config_id, status);

-- Arbitrage trades indexes
CREATE INDEX idx_arbitrage_trades_user_id ON public.arbitrage_trades(user_id);
CREATE INDEX idx_arbitrage_trades_executed_at ON public.arbitrage_trades(executed_at);
CREATE INDEX idx_arbitrage_trades_status ON public.arbitrage_trades(status);
CREATE INDEX idx_arbitrage_trades_tx_hash ON public.arbitrage_trades(tx_hash);
CREATE INDEX idx_arbitrage_trades_profit ON public.arbitrage_trades(profit DESC);
CREATE INDEX idx_arbitrage_trades_user_status ON public.arbitrage_trades(user_id, status);

-- System logs indexes
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_component ON public.system_logs(component);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at);
CREATE INDEX idx_system_logs_user_level ON public.system_logs(user_id, level) WHERE user_id IS NOT NULL;

-- Price feeds indexes
CREATE INDEX idx_price_feeds_token_dex ON public.price_feeds(token_address, dex);
CREATE INDEX idx_price_feeds_timestamp ON public.price_feeds(timestamp);
CREATE INDEX idx_price_feeds_symbol_dex ON public.price_feeds(token_symbol, dex);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_type_priority ON public.notifications(type, priority);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at);

-- Bot status indexes
CREATE INDEX idx_bot_status_config_id ON public.bot_status(config_id);
CREATE INDEX idx_bot_status_status ON public.bot_status(status);
CREATE INDEX idx_bot_status_updated_at ON public.bot_status(updated_at);
