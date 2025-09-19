export interface MessagingConfig {
  rabbitmqUrl: string;
  exchange: string;
  exchangeType: string;
}

export const createMessagingConfig = (): MessagingConfig => ({
  rabbitmqUrl:
    process.env.RABBITMQ_URL || 'amqp://admin:password123@localhost:5672',
  exchange: process.env.RABBITMQ_EXCHANGE || 'magma',
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || 'topic',
});
