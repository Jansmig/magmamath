/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';
import {
  UpdateUserInput,
  UserRepository,
  PaginatedResult,
} from './users.repository';
import { UserMapper } from './mappers/user.mapper';
import { User } from './domain/user';

// this could be configured in some config
const DEFAULT_PAGE_LIMIT = 3;

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { name, email } = createUserDto;
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const newUser = await this.userRepository.create({ name, email });
      return newUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async findMany(page: number = 1): Promise<PaginatedResult<User>> {
    try {
      const limit = DEFAULT_PAGE_LIMIT;

      if (page < 1) {
        throw new BadRequestException('Page number must be greater than 0');
      }

      const result = await this.userRepository.findMany({ page, limit });
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async updateOne(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const { name, email } = updateUserDto;
    const normalizedEmail = email?.toLowerCase();

    if (normalizedEmail) {
      const existingUserWithSameEmail =
        await this.userRepository.findByEmail(normalizedEmail);
      if (existingUserWithSameEmail && existingUserWithSameEmail.id !== id) {
        throw new ConflictException('This email is already used');
      }
    }

    const updateData: UpdateUserInput = {
      name,
      email: normalizedEmail,
    };

    try {
      const updatedUser = await this.userRepository.updateById(id, updateData);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async removeOne(id: string): Promise<User> {
    try {
      const deletedUser = await this.userRepository.deleteById(id);
      if (!deletedUser) {
        throw new NotFoundException('User not found');
      }
      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
