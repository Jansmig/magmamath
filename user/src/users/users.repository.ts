import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { UserMapper } from './mappers/user.mapper';
import { User } from './domain/user';

export type CreateUserInput = {
  name: string;
  email: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserDocument.name) private model: Model<UserDocument>,
  ) {}

  async create(userData: CreateUserInput): Promise<User> {
    const createdUser = new this.model(userData);
    const document = await createdUser.save();
    return UserMapper.fromDocumentToEntity(document);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.model.findById(id).exec();
    return document ? UserMapper.fromDocumentToEntity(document) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.model.findOne({ email }).exec();
    return document ? UserMapper.fromDocumentToEntity(document) : null;
  }

  async updateById(
    id: string,
    updateData: UpdateUserInput,
  ): Promise<User | null> {
    const document = await this.model
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .exec();
    return document ? UserMapper.fromDocumentToEntity(document) : null;
  }

  async deleteById(id: string): Promise<User | null> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result ? UserMapper.fromDocumentToEntity(result) : null;
  }
}
