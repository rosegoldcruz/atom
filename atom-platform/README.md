# ATOM - Live Arbitrage Automation Platform

> **ATOM is not a crypto exchange. It’s a live arbitrage automation platform for normal people.**

ATOM transforms complex DeFi arbitrage into a visible, controllable, and safety-first experience where users allocate capital and observe execution in real time.

## 🎯 What Makes ATOM Different

- **Live Transparency**: Real-time execution visibility - you see everything happening
- **Atomic Safety**: Profit-or-revert protection - you never lose money on failed trades
- **Normal Person Friendly**: No crypto expertise required - simple dashboard interface
- **Event-Driven Truth**: Dashboard reflects reality, not inference - every action is logged
- **Modular Strategies**: Upgradeable strategy platform - choose your risk profile
- **Safety-First Design**: Protection triggers are features, not bugs - automatic circuit breakers

## 🏗️ Architecture

### Backend Services
- **Event Bus**: Central nervous system using Redis/Kafka for event streaming
- **Market Data Service**: Fetches DEX prices and detects arbitrage opportunities
- **Simulation Engine**: Validates arbitrage paths before execution
- **Orchestrator**: Gatekeeper that enforces global limits and safety rules
- **Execution Bot**: Submits transactions and manages execution state
- **Safety Monitor**: Watches for protection triggers and circuit breakers

### Frontend Dashboard
- **React/Next.js**: Modern, responsive web application
- **Event-Driven UI**: Real-time updates via WebSocket streaming
- **Live Activity Feed**: See every opportunity, simulation, and execution
- **Strategy Management**: Choose and configure arbitrage strategies
- **Safety Monitoring**: Visual protection status and risk metrics

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL and Redis (or use Docker Compose)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd atom-platform
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```bash
# Database
DATABASE_URL=postgresql://atom:atom_password@localhost:5432/atom_platform
REDIS_URL=redis://localhost:6379

# Blockchain (add your RPC URLs)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_KEY

# Wallet (for execution bot)
PRIVATE_KEY=your_private_key_here
```

4. Start with Docker Compose:
```bash
docker-compose up -d
```

5. Access the platform:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start backend:
```bash
cd backend
npm install
npm run dev
```

3. Start frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📊 Dashboard Features

### Command Center (Main Dashboard)
- **System Status**: Live indicator of platform health
- **Overview Cards**: Total P&L, active capital, daily trades, success rate
- **Opportunity Pulse**: Real-time stream of detected opportunities
- **Execution Snapshot**: Pending transactions and recent activity
- **Risk Panel**: Protection metrics and safety triggers

### Live Activity Feed
- **Event Stream**: Chronological view of all system events
- **Filtering**: Filter by event type (opportunities, executions, safety triggers)
- **Real-time Updates**: WebSocket-powered live updates
- **Event Details**: Expand each event to see full payload data

### Strategy Management
- **Strategy Cards**: Visual overview of available strategies
- **Performance Metrics**: Win rates, average profits, risk ratings
- **Activation Controls**: Enable/disable strategies with one click
- **Risk Profiles**: Conservative, Balanced, Aggressive options

## 🔒 Safety Features

### Atomic Execution
- **Profit-or-Revert**: All transactions complete safely in one shot or don't happen
- **Flash Loan Protection**: No capital at risk during execution
- **Zero Loss Guarantee**: Reverted transactions cost nothing but gas

### Protection Systems
- **Gas Spike Detection**: Auto-pause when transaction costs spike
- **MEV Risk Avoidance**: Protection against sandwich attacks
- **Slippage Limits**: Automatic revert if pricing moves too much
- **Circuit Breakers**: System-wide safety triggers
- **Revert Rate Monitoring**: Pause after multiple consecutive failures

## 🎮 For Users (Average Joe)

### How It Works
1. **Create Account**: Sign up and connect your wallet
2. **Choose Strategy**: Select Conservative, Balanced, or Aggressive profile
3. **Set Limits**: Configure your safety parameters (gas caps, slippage)
4. **Activate**: Turn on the system and watch it work
5. **Monitor**: See live execution and profits in real-time

### What You See
- **Live Opportunities**: Real-time detection of arbitrage chances
- **Execution Status**: Every transaction submitted and confirmed
- **Profit Tracking**: Clear breakdown of earnings and fees
- **Safety Events**: Protection mechanisms working in your favor
- **Risk Metrics**: Visual indicators of system health

### What You Don't Need to Know
- ❌ Tokenomics or DeFi protocols
- ❌ Gas optimization or transaction building
- ❌ MEV protection or sandwich attacks
- ❌ Arbitrage path calculation
- ❌ Risk management or position sizing

## 🔧 For Developers

### Event Schema
The platform uses a strict event schema for all communication:
- `opportunity.detected`: New arbitrage opportunity found
- `simulation.started/completed`: Pre-execution validation
- `execution.submitted/confirmed/reverted`: Transaction lifecycle
- `safety.triggered`: Protection mechanism activated
- `profit.realized`: Successful arbitrage profit

### Service Architecture
Each backend service has clearly defined:
- **Purpose**: What it does
- **Emits**: Events it produces
- **Consumes**: Events it listens to
- **Failure Behavior**: What happens when it fails
- **Blast Radius**: Impact of service failure

### Adding New Features
1. **New Strategies**: Add to simulation engine and market data service
2. **New Events**: Extend the event schema in `shared/event-schema.ts`
3. **New Dashboard Features**: Add React components and subscribe to events
4. **New Safety Rules**: Extend safety monitor thresholds and triggers

## 🛡️ Security & Compliance

### Non-Custodial Design
- ATOM never holds user funds
- Wallet only authorizes atomic execution
- Users can withdraw anytime
- Smart contracts are the only authority

### Risk Disclosures
- Clear profit non-guarantees
- Transparent fee structures
- Honest risk explanations
- No investment advice language

### Audit Trail
- Every action is logged and immutable
- Complete transaction history
- Replay capability for analysis
- Transparent fee breakdowns

## 📈 Performance Metrics

### Success Metrics
- User understands system state within 10 seconds
- Users can explain why trades revert
- High session duration on Live Activity page
- Low support tickets related to "what happened"

### Technical Metrics
- Dashboard latency < 500ms
- Live feed updates < 250ms
- System availability > 99.9%
- Transaction success rate > 95%

## 🚀 Future Roadmap

### Phase 1 (Current)
- ✅ Basic arbitrage strategies
- ✅ Real-time dashboard
- ✅ Safety systems
- ✅ Event streaming

### Phase 2 (Next)
- 📋 Mobile app
- 📋 Advanced analytics
- 📋 Strategy marketplace
- 📋 API access for institutions

### Phase 3 (Future)
- 📋 Multi-chain support
- 📋 Advanced MEV protection
- 📋 Yield farming strategies
- 📋 Institutional features

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the docs/ directory
- **Issues**: Create an issue on GitHub
- **Discord**: Join our community server
- **Email**: support@atom.com

---

**Built with ❤️ for the future of automated finance**