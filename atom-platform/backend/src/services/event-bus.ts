/**
 * Event Bus Service - Central Nervous System of ATOM
 * Purpose: Transport events, enforce ordering, enable replay
 * Forbidden: Decision making, execution control
 */

import { EventEmitter } from 'events';
import Redis from 'redis';
import { Kafka, Producer, Consumer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { EventEnvelope, AtomEvent, EVENT_SCHEMAS, EventType } from '../../../shared/event-schema';
import { logger } from '../utils/logger';

export class EventBusService extends EventEmitter {
  private redis!: Redis.RedisClientType;
  private kafka!: Kafka;
  private producer!: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private isConnected = false;
  private eventBuffer: EventEnvelope[] = [];
  private readonly BUFFER_LIMIT = 1000;

  constructor() {
    super();
    this.setupRedis();
    this.setupKafka();
  }

  private setupRedis(): void {
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Max retries exceeded');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.redis.on('error', (err) => {
      logger.error('Redis error:', err);
      this.emit('error', err);
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  private setupKafka(): void {
    this.kafka = new Kafka({
      clientId: 'atom-event-bus',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      retry: {
        retries: 5,
        initialRetryTime: 100,
        factor: 2
      }
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
      retry: {
        retries: 5
      }
    });
  }

  async connect(): Promise<void> {
    try {
      // Connect Redis
      await this.redis.connect();
      
      // Connect Kafka
      await this.producer.connect();
      
      this.isConnected = true;
      logger.info('Event Bus connected');
      
      // Process buffered events
      await this.processBufferedEvents();
      
    } catch (error) {
      logger.error('Event Bus connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    
    // Disconnect all consumers
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
    
    // Disconnect producer
    await this.producer.disconnect();
    
    // Disconnect Redis
    await this.redis.disconnect();
    
    logger.info('Event Bus disconnected');
  }

  /**
   * Append event to the event bus
   * This is the only way to emit events - ensures validation and ordering
   */
  async appendEvent(event: Omit<AtomEvent, 'event_id' | 'timestamp'>): Promise<EventEnvelope> {
    const eventEnvelope: EventEnvelope = {
      event_id: uuidv4(),
      event_type: event.event_type,
      event_version: event.event_version,
      source: event.source,
      severity: event.severity,
      payload: event.payload,
      timestamp: {
        iso: new Date().toISOString(),
        unix_ms: Date.now()
      }
    };

    // Validate event against schema
    const schema = EVENT_SCHEMAS[event.event_type as EventType];
    if (!schema) {
      throw new Error(`Unknown event type: ${event.event_type}`);
    }

    try {
      schema.parse(eventEnvelope);
    } catch (error) {
      logger.error('Event validation failed:', error);
      throw error;
    }

    if (!this.isConnected) {
      // Buffer events if not connected
      this.bufferEvent(eventEnvelope);
      return eventEnvelope;
    }

    try {
      // Store in Redis for replay capability
      await this.storeEvent(eventEnvelope);
      
      // Publish to Kafka for distribution
      await this.publishEvent(eventEnvelope);
      
      // Emit locally for immediate processing
      this.emit('event', eventEnvelope);
      
      logger.debug(`Event appended: ${event.event_type}`);
      return eventEnvelope;
      
    } catch (error) {
      logger.error('Failed to append event:', error);
      this.bufferEvent(eventEnvelope);
      throw error;
    }
  }

  /**
   * Subscribe to events by type
   */
  async subscribe(eventTypes: EventType[], groupId: string, callback: (event: EventEnvelope) => void): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: groupId,
      retry: {
        retries: 3
      }
    });

    await consumer.connect();
    await consumer.subscribe({
      topics: eventTypes.map(type => `atom.${type}`),
      fromBeginning: false
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (message.value) {
          try {
            const event = JSON.parse(message.value.toString()) as EventEnvelope;
            callback(event);
          } catch (error) {
            logger.error('Failed to process message:', error);
          }
        }
      }
    });

    this.consumers.set(groupId, consumer);
  }

  /**
   * Replay events from a specific time
   */
  async replayEvents(fromTime: number, toTime?: number, eventTypes?: EventType[]): Promise<EventEnvelope[]> {
    try {
      const pattern = 'atom:event:*';
      const keys = await this.redis.keys(pattern);
      
      const events: EventEnvelope[] = [];
      
      for (const key of keys) {
        const eventData = await this.redis.get(key);
        if (eventData) {
          const event = JSON.parse(eventData) as EventEnvelope;
          
          // Filter by time range
          if (event.timestamp.unix_ms >= fromTime && (!toTime || event.timestamp.unix_ms <= toTime)) {
            // Filter by event types if specified
            if (!eventTypes || eventTypes.includes(event.event_type as EventType)) {
              events.push(event);
            }
          }
        }
      }
      
      // Sort by timestamp (deterministic ordering)
      return events.sort((a, b) => {
        if (a.timestamp.block_number && b.timestamp.block_number) {
          return a.timestamp.block_number - b.timestamp.block_number;
        }
        if (a.timestamp.unix_ms !== b.timestamp.unix_ms) {
          return a.timestamp.unix_ms - b.timestamp.unix_ms;
        }
        return a.event_id.localeCompare(b.event_id);
      });
      
    } catch (error) {
      logger.error('Replay events failed:', error);
      throw error;
    }
  }

  /**
   * Get current system status
   */
  async getSystemStatus(): Promise<'CONNECTED' | 'DEGRADED' | 'DISCONNECTED'> {
    if (!this.isConnected) return 'DISCONNECTED';
    
    try {
      await this.redis.ping();
      return 'CONNECTED';
    } catch (error) {
      return 'DEGRADED';
    }
  }

  private async storeEvent(event: EventEnvelope): Promise<void> {
    const key = `atom:event:${event.event_id}`;
    await this.redis.set(key, JSON.stringify(event), {
      EX: 60 * 60 * 24 * 7 // 7 days TTL
    });
  }

  private async publishEvent(event: EventEnvelope): Promise<void> {
    await this.producer.send({
      topic: `atom.${event.event_type}`,
      messages: [{
        key: event.event_id,
        value: JSON.stringify(event),
        timestamp: event.timestamp.unix_ms.toString()
      }]
    });
  }

  private bufferEvent(event: EventEnvelope): void {
    this.eventBuffer.push(event);
    
    if (this.eventBuffer.length > this.BUFFER_LIMIT) {
      // Drop oldest events if buffer overflows
      this.eventBuffer.shift();
      logger.warn('Event buffer overflow, dropping oldest event');
    }
  }

  private async processBufferedEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;
    
    logger.info(`Processing ${this.eventBuffer.length} buffered events`);
    
    for (const event of this.eventBuffer) {
      try {
        await this.storeEvent(event);
        await this.publishEvent(event);
        this.emit('event', event);
      } catch (error) {
        logger.error('Failed to process buffered event:', error);
      }
    }
    
    this.eventBuffer = [];
  }

  /**
   * Get status of the event bus
   */
  getStatus(): {
    isConnected: boolean;
    bufferedEvents: number;
    activeConsumers: number;
  } {
    return {
      isConnected: this.isConnected,
      bufferedEvents: this.eventBuffer.length,
      activeConsumers: this.consumers.size
    };
  }
}

// Singleton instance
export const eventBus = new EventBusService();