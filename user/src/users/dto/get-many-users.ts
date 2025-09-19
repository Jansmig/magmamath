import { IsNumber } from 'class-validator';

export class FindManyUsersDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;
}
