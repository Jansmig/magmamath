import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class IsMongoId implements PipeTransform<any, string> {
  public transform(value: unknown): string {
    const validObjectId = isMongoId(value);

    if (!validObjectId) {
      throw new BadRequestException('Invalid mongo id string');
    }

    return value as string;
  }
}
