# ATOM Arbitrage System - Supabase Schema

## 🚀 **Overview**

This directory contains the complete Supabase database schema for the ATOM arbitrage platform, organized following AEON platform standards and Vercel best practices.

## 📁 **Directory Structure**

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql      # Core tables and indexes
│   ├── 002_triggers_functions.sql  # Functions, triggers, and automation
│   └── 003_row_level_security.sql  # RLS policies and security
├── config.toml                     # Supabase configuration
├── seed.sql                        # Development seed data
└── README.md                       # This documentation
```

## 🗄️ **Database Schema**

### **Core Tables**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles and settings | Extends auth.users, subscription tiers |
| `arbitrage_config` | Trading configurations | Per-user bot settings, risk management |
| `arbitrage_opportunities` | Detected opportunities | Real-time arbitrage chances |
| `arbitrage_trades` | Executed trades | Trade history and results |
| `system_logs` | Application logs | Structured logging with metadata |
| `price_feeds` | Market data | Token prices across DEXes |
| `bot_status` | Bot monitoring | Health and performance metrics |
| `notifications` | User alerts | Multi-channel notification system |

### **Key Features**

- ✅ **Row Level Security (RLS)** - Complete data isolation
- ✅ **Automated Triggers** - Auto-updating timestamps and user setup
- ✅ **Performance Indexes** - Optimized for high-frequency queries
- ✅ **Analytics Functions** - Built-in reporting and statistics
- ✅ **Cleanup Automation** - Automatic data lifecycle management
- ✅ **Multi-tenant Architecture** - Secure user data separation

## 🔧 **Setup Instructions**

### **1. Local Development**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
cd atom-app/backend
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db reset

# Load seed data (optional)
supabase db seed
```

### **2. Production Deployment**

```bash
# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
supabase db push

# Verify deployment
supabase db diff
```

## 🔐 **Security Model**

### **Row Level Security Policies**

- **Users**: Can only access their own profile data
- **Configs**: Users manage their own arbitrage configurations
- **Trades**: Users see only their own trading history
- **Opportunities**: Users see opportunities for their configs only
- **Logs**: Users see logs related to their activities
- **Notifications**: Users manage their own notifications

### **Role-Based Access**

| Role | Permissions |
|------|-------------|
| `authenticated` | Standard user operations |
| `service_role` | Bot operations, system management |
| `admin` | Full system access (via user.role = 'admin') |

## 📊 **Analytics & Monitoring**

### **Built-in Functions**

```sql
-- Get user trading statistics
SELECT * FROM public.get_user_stats('user-uuid');

-- Get recent opportunities
SELECT * FROM public.get_recent_opportunities('user-uuid', 50);

-- Get daily profit summary
SELECT * FROM public.get_daily_profit_summary('user-uuid', 30);
```

### **System Monitoring**

```sql
-- Check bot status
SELECT * FROM public.bot_status WHERE status = 'running';

-- View system health
SELECT level, COUNT(*) FROM public.system_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY level;
```

## 🔄 **Data Lifecycle**

### **Automatic Cleanup**

The system includes automated cleanup functions:

- **Expired Opportunities**: Removed every 5 minutes
- **Old Notifications**: Cleaned daily (30-day retention)
- **System Logs**: Configurable retention period

### **Recommended Cron Jobs**

```bash
# Clean expired opportunities (every 5 minutes)
*/5 * * * * SELECT clean_expired_opportunities();

# Clean old notifications (daily at 2 AM)
0 2 * * * SELECT clean_old_notifications();

# Database maintenance (weekly)
0 4 * * 0 VACUUM ANALYZE;
```

## 🚀 **Performance Optimization**

### **Indexes**

All tables include optimized indexes for:
- User-specific queries
- Time-based filtering
- Status-based filtering
- Profit/performance sorting

### **Query Patterns**

The schema is optimized for:
- Real-time opportunity detection
- User dashboard queries
- Historical trade analysis
- System monitoring

## 🧪 **Development Helpers**

### **Sample Data Generation**

```sql
-- Generate sample opportunities for testing
SELECT public.generate_sample_opportunities('config-uuid', 10);

-- Generate sample trades for testing
SELECT public.generate_sample_trades('user-uuid', 'config-uuid', 20);
```

## 🔧 **Environment Variables**

Required environment variables:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## 📝 **Migration History**

| Version | Description | Date |
|---------|-------------|------|
| 001 | Initial schema with core tables | 2025-01-16 |
| 002 | Functions, triggers, and automation | 2025-01-16 |
| 003 | Row Level Security policies | 2025-01-16 |

## 🤝 **Contributing**

When adding new migrations:

1. Create new migration file with incremental number
2. Follow naming convention: `XXX_description.sql`
3. Include rollback instructions in comments
4. Test locally before deploying
5. Update this README with changes

## 🆘 **Troubleshooting**

### **Common Issues**

1. **RLS Policy Errors**: Check user authentication and role assignments
2. **Migration Failures**: Verify dependencies and rollback if needed
3. **Performance Issues**: Check query plans and index usage
4. **Permission Errors**: Verify service role configuration

### **Useful Commands**

```bash
# Check migration status
supabase migration list

# Create new migration
supabase migration new migration_name

# Reset local database
supabase db reset

# View logs
supabase logs
```

## 📞 **Support**

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the AEON platform guidelines
- Contact the development team

---

**Built with ❤️ for the ATOM Arbitrage Platform**
