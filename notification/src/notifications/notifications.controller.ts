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
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log('Received user created event');
    console.log(data);
    console.log('Context:', context.getPattern());
  }

  @MessagePattern('user.deleted')
  async handleUserDeletedEvent(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log('Received user deleted event');
    console.log(data);
    console.log('Context:', context.getPattern());
  }
}
