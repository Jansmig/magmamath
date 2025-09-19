import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL || 'amqp://admin:password123@rabbitmq:5672',
      ],
      queue: 'notification_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
      exchange: process.env.RABBITMQ_EXCHANGE || 'magma',
      exchangeType: 'topic',
      wildcards: true,
      routingKey: 'user.*',
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3001);

  console.log('Notification service is listening for events...');
}
bootstrap();
