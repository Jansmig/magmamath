import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const USER_COLLECTION_NAME = 'users';

@Schema({ timestamps: true, collection: USER_COLLECTION_NAME })
export class UserDocument {
  public _id: Types.ObjectId;
  public createdAt: Date;
  public updatedAt: Date;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
