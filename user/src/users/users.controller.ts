import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { randomUUID } from 'node:crypto';
import { Context } from '../shared/context';
import { IsMongoId } from '../validators/is-mongo-id';
import { FindManyUsersDto } from './dto/get-many-users';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(
      createUserDto,
      this.getContext(),
    );
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  async findMany(@Query() query: FindManyUsersDto) {
    const { page, limit } = query;
    const result = await this.usersService.findMany(
      page,
      limit,
      this.getContext(),
    );
    return {
      message: 'Users retrieved successfully',
      ...result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', IsMongoId) id: string) {
    const user = await this.usersService.findOne(id, this.getContext());
    return {
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', IsMongoId) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateOne(
      id,
      updateUserDto,
      this.getContext(),
    );
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  async remove(@Param('id', IsMongoId) id: string) {
    const user = await this.usersService.removeOne(id, this.getContext());
    return {
      message: 'User deleted successfully',
      data: user,
    };
  }

  // In real application there would be some context available with properties such as correlationId allowing for tracking entire request life cycle. It would be generated in some Gateway and passed further to the service. As there is no Gateway in this example, it is generated here for the example purposes. Ideally both Logger (injectable service) and Context interface would be available in some company-wide library. Example context properties could include: userId, app version, etc.
  private getContext(): Context {
    return {
      correlationId: randomUUID(),
    };
  }
}
