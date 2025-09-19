import { Module, Global } from '@nestjs/common';
import { MessagingService } from './services/messaging.service';
import { createMessagingConfig } from './config/messaging.config';

@Global()
@Module({
  providers: [
    {
      provide: 'MESSAGING_CONFIG',
      useFactory: createMessagingConfig,
    },
    {
      provide: MessagingService,
      useFactory: (config) => new MessagingService(config),
      inject: ['MESSAGING_CONFIG'],
    },
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
