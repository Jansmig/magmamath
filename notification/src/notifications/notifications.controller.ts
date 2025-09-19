/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class NotificationsController {
  @MessagePattern('user.created')
  async handleUserCreatedEvent(
    @Payload() data: any, // please see the explanation why 'any' is used.
    @Ctx() rmqContext: RmqContext,
  ): Promise<void> {
    try {
      console.log('Received user created event');
      console.log(data);
      console.log('Sending welcome email to user');

      rmqContext.getChannelRef().ack(rmqContext.getMessage());
    } catch (error) {
      console.error('Error processing user created event:', error);
    }
  }

  @MessagePattern('user.deleted')
  async handleUserDeletedEvent(
    @Payload() data: any, // please see the explanation why 'any' is used.
    @Ctx() rmqContext: RmqContext,
  ): Promise<void> {
    try {
      console.log('Received user deleted event');
      console.log(data);
      console.log('Sending goodbye email to user');

      rmqContext.getChannelRef().ack(rmqContext.getMessage());
    } catch (error) {
      console.error('Error processing user deleted event:', error);
    }
  }
}
