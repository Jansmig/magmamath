import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UpdateUserInput,
  UserRepository,
  PaginatedResult,
} from './users.repository';
import { User } from './domain/user';
import { MessagingService } from '../messaging/services/messaging.service';
import { USER_TOPICS } from '../messaging/topics/user.topics';
import { Context } from '../shared/context';

// this could be configured in some config
const DEFAULT_PAGE_LIMIT = 3;

@Injectable()
export class UsersService {
  // As mentioned earlier, logger could be shared in some common library and injected as a service. Here the nest.js logger is used for simplicity.
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    context: Context,
  ): Promise<User> {
    try {
      const { name, email } = createUserDto;
      this.logger.debug('Creating user', {
        email,
        name,
        correlationId: context.correlationId,
      });

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        this.logger.warn(`User creation failed, email already exists`, {
          email,
          correlationId: context.correlationId,
        });
        throw new BadRequestException('User with this email already exists');
      }

      const newUser = await this.userRepository.create({ name, email });
      this.logger.debug('User created successfully', {
        userId: newUser.id,
        email,
        name,
        correlationId: context.correlationId,
      });

      await this.messagingService.publish(USER_TOPICS.USER_CREATED, {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
      });

      return newUser;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error; // already logged above
      }

      this.logger.error('Failed to create user - unhandled error', {
        email: createUserDto.email,
        name: createUserDto.name,
        errorMessage: (error as Error).message,
        correlationId: context.correlationId,
      });
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findOne(id: string, context: Context): Promise<User> {
    this.logger.debug(`Finding user`, {
      userId: id,
      correlationId: context.correlationId,
    });

    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        this.logger.warn(`User not found`, {
          userId: id,
          correlationId: context.correlationId,
        });
        throw new NotFoundException('User not found');
      }

      this.logger.debug(`User found`, {
        userId: id,
        correlationId: context.correlationId,
      });
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to find user`, {
        userId: id,
        errorMessage: (error as Error).message,
        correlationId: context.correlationId,
      });
      throw new InternalServerErrorException('Failed to find user');
    }
  }

  async findMany(
    page: number = 1,
    context: Context,
  ): Promise<PaginatedResult<User>> {
    this.logger.debug(`Finding many users`, {
      page,
      correlationId: context.correlationId,
    });

    try {
      const limit = DEFAULT_PAGE_LIMIT;

      if (page < 1) {
        this.logger.warn(`Invalid page number provided`, {
          page,
          correlationId: context.correlationId,
        });
        throw new BadRequestException('Page number must be greater than 0');
      }

      const result = await this.userRepository.findMany({ page, limit });
      this.logger.debug(`Found many users`, {
        page,
        total: result.metadata.total,
        correlationId: context.correlationId,
      });

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`Failed to retrieve many users`, {
        page,
        errorMessage: (error as Error).message,
        correlationId: context.correlationId,
      });
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async updateOne(
    id: string,
    updateUserDto: UpdateUserDto,
    context: Context,
  ): Promise<User> {
    this.logger.debug(`Updating user`, {
      userId: id,
      correlationId: context.correlationId,
    });

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      this.logger.warn(`User not found for update`, {
        userId: id,
        correlationId: context.correlationId,
      });
      throw new NotFoundException('User not found');
    }

    const { name, email } = updateUserDto;
    const normalizedEmail = email?.toLowerCase();

    if (normalizedEmail) {
      const existingUserWithSameEmail =
        await this.userRepository.findByEmail(normalizedEmail);
      if (existingUserWithSameEmail && existingUserWithSameEmail.id !== id) {
        this.logger.warn(`Email conflict during update`, {
          userId: id,
          email: normalizedEmail,
          correlationId: context.correlationId,
        });
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
        this.logger.warn(`User not found during update`, {
          userId: id,
          correlationId: context.correlationId,
        });
        throw new NotFoundException('User not found');
      }

      this.logger.debug(`User updated successfully`, {
        userId: id,
        email: updatedUser.email || '',
        name: updatedUser.name || '',
        correlationId: context.correlationId,
      });
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to update user`, {
        userId: id,
        errorMessage: (error as Error).message,
        correlationId: context.correlationId,
      });
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async removeOne(id: string, context: Context): Promise<User> {
    this.logger.debug(`Deleting user`, {
      userId: id,
      correlationId: context.correlationId,
    });

    try {
      const deletedUser = await this.userRepository.deleteById(id);
      if (!deletedUser) {
        this.logger.warn(`User not found for deletion`, {
          userId: id,
          correlationId: context.correlationId,
        });
        throw new NotFoundException('User not found');
      }

      this.logger.debug(`User deleted successfully`, {
        userId: id,
        correlationId: context.correlationId,
      });

      await this.messagingService.publish(USER_TOPICS.USER_DELETED, {
        userId: deletedUser.id,
      });

      return deletedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to delete user`, {
        userId: id,
        errorMessage: (error as Error).message,
        correlationId: context.correlationId,
      });
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
