/**
 * ATOM Platform Backend Entry Point
 * Initializes and coordinates all backend services
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { eventBus } from './services/event-bus';
import { MarketDataService } from './services/market-data';
import { SimulationEngine } from './services/simulation';
import { OrchestratorService } from './services/orchestrator';
import { ExecutionBotService } from './services/execution-bot';
import { SafetyMonitorService } from './services/safety-monitor';

// Load environment variables
dotenv.config();

class ATOMBackend {
  private app = express();
  private server = createServer(this.app);
  private wss = new WebSocketServer({ server: this.server });
  
  private services = {
    marketData: new MarketDataService(eventBus),
    simulation: new SimulationEngine(eventBus),
    orchestrator: new OrchestratorService(eventBus),
    executionBot: new ExecutionBotService(eventBus),
    safetyMonitor: new SafetyMonitorService(eventBus)
  };

  private websocketClients = new Set<any>();

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: this.getServiceStatus()
      });
    });

    // API routes
    this.app.get('/api/events', this.handleEventStream.bind(this));
    this.app.get('/api/stats', this.handleGetStats.bind(this));
    this.app.get('/api/bots', this.handleGetBots.bind(this));
    this.app.get('/api/safety', this.handleGetSafety.bind(this));
    
    // Error handling
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      logger.info('WebSocket client connected');
      this.websocketClients.add(ws);

      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to ATOM Event Stream',
        timestamp: new Date().toISOString()
      }));

      // Handle client messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, message);
        } catch (error) {
          logger.error('Invalid WebSocket message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
        this.websocketClients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.websocketClients.delete(ws);
      });
    });

    // Subscribe to all events and broadcast to WebSocket clients
    eventBus.on('event', (event) => {
      this.broadcastToClients({
        type: 'event',
        data: event,
        timestamp: new Date().toISOString()
      });
    });
  }

  private handleWebSocketMessage(ws: any, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Handle event subscription
        ws.send(JSON.stringify({
          type: 'subscription',
          message: `Subscribed to events: ${message.events?.join(', ') || 'all'}`,
          timestamp: new Date().toISOString()
        }));
        break;
        
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
        break;
        
      default:
        logger.warn('Unknown WebSocket message type:', message.type);
    }
  }

  private broadcastToClients(data: any): void {
    const message = JSON.stringify(data);
    
    this.websocketClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  private async handleEventStream(req: express.Request, res: express.Response): Promise<void> {
    const { from, to, types } = req.query;
    
    try {
      const fromTime = from ? parseInt(from as string) : Date.now() - 3600000; // Last hour
      const toTime = to ? parseInt(to as string) : Date.now();
      const eventTypes = types ? (types as string).split(',') : undefined;
      
      const events = await eventBus.replayEvents(fromTime, toTime, eventTypes as any);
      
      res.json({
        events,
        count: events.length,
        from: fromTime,
        to: toTime
      });
      
    } catch (error) {
      logger.error('Failed to get events:', error);
      res.status(500).json({ error: 'Failed to retrieve events' });
    }
  }

  private handleGetStats(req: express.Request, res: express.Response): void {
    res.json({
      services: this.getServiceStatus(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    });
  }

  private handleGetBots(req: express.Request, res: express.Response): void {
    res.json({
      bots: this.services.executionBot.getBotStates(),
      activeExecutions: this.services.executionBot.getActiveExecutions(),
      timestamp: new Date().toISOString()
    });
  }

  private handleGetSafety(req: express.Request, res: express.Response): void {
    res.json({
      metrics: this.services.safetyMonitor.getSafetyMetrics(),
      thresholds: this.services.safetyMonitor.getSafetyThresholds(),
      state: this.services.safetyMonitor.getSafetyState(),
      timestamp: new Date().toISOString()
    });
  }

  private getServiceStatus(): Record<string, any> {
    return {
      eventBus: eventBus.getStatus(),
      marketData: this.services.marketData.getStatus(),
      simulation: this.services.simulation.getStatus(),
      orchestrator: {
        stats: this.services.orchestrator.getStats(),
        limits: this.services.orchestrator.getGlobalLimits(),
        status: this.services.orchestrator.getSystemStatus()
      },
      executionBot: this.services.executionBot.getStatus(),
      safetyMonitor: this.services.safetyMonitor.getStatus()
    };
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting ATOM Backend...');
      
      // Connect event bus
      await eventBus.connect();
      
      // Start all services
      await Promise.all([
        this.services.marketData.start(),
        this.services.simulation.start(),
        this.services.orchestrator.start(),
        this.services.executionBot.start(),
        this.services.safetyMonitor.start()
      ]);
      
      // Start HTTP server
      const port = process.env.PORT || 3001;
      this.server.listen(port, () => {
        logger.info(`ATOM Backend listening on port ${port}`);
        logger.info('All services started successfully');
      });
      
    } catch (error) {
      logger.error('Failed to start ATOM Backend:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping ATOM Backend...');
    
    // Close WebSocket server
    this.wss.close();
    
    // Stop all services
    await Promise.all([
      this.services.marketData.stop(),
      this.services.simulation.stop(),
      this.services.orchestrator.stop(),
      this.services.executionBot.stop(),
      this.services.safetyMonitor.stop()
    ]);
    
    // Disconnect event bus
    await eventBus.disconnect();
    
    // Close HTTP server
    this.server.close(() => {
      logger.info('ATOM Backend stopped');
    });
  }
}

// Create and export backend instance
const backend = new ATOMBackend();

// Handle process signals
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await backend.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await backend.stop();
  process.exit(0);
});

// Start the backend if this file is run directly
if (require.main === module) {
  backend.start().catch((error) => {
    logger.error('Failed to start backend:', error);
    process.exit(1);
  });
}

export default backend;