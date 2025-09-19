/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import type { MessagingConfig } from '../config/messaging.config';
import { BaseEvent } from '../interfaces/events.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingService.name);
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  constructor(private readonly config: MessagingConfig) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      this.logger.log(`Connecting to RabbitMQ: ${this.config.rabbitmqUrl}`);

      // Connect to RabbitMQ
      this.connection = await amqp.connect(this.config.rabbitmqUrl);

      // Create channel
      this.channel = await this.connection.createChannel();

      // Assert exchange exists
      await this.channel.assertExchange(
        this.config.exchange,
        this.config.exchangeType,
        { durable: true },
      );

      this.isConnected = true;
      this.logger.log(
        `Successfully connected to RabbitMQ exchange: ${this.config.exchange}`,
      );

      // Handle connection errors
      this.connection.on('error', (error: any) => {
        this.logger.error('RabbitMQ connection error:', error);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.isConnected = false;
      });
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error during RabbitMQ disconnection:', error);
    }
  }

  async publish(topic: string, payload: Record<string, any>): Promise<void> {
    if (!this.isConnected || !this.channel) {
      this.logger.error('Cannot publish message: not connected to RabbitMQ');
      throw new Error('MessagingService is not connected to RabbitMQ');
    }

    const event: BaseEvent = {
      eventId: randomUUID(),
      payload,
    };

    const message = Buffer.from(JSON.stringify(event));

    try {
      const published = this.channel.publish(
        this.config.exchange,
        topic,
        message,
        {
          persistent: true,
          messageId: event.eventId,
        },
      );

      if (!published) {
        throw new Error('Failed to publish message to exchange');
      }

      this.logger.log(
        `Published event with ID ${event.eventId} to topic ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }
}
