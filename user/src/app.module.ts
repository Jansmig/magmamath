import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { MessagingModule } from './messaging/messaging.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:password123@mongodb:27017/magmamath?authSource=admin',
    ),
    MessagingModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
