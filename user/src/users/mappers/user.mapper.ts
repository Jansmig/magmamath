import { UserDocument } from '../schemas/user.schema';
import { User } from '../domain/user';

export class UserMapper {
  static fromDocumentToEntity(document: UserDocument): User {
    return {
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  static fromEntityToDocument(entity: User): Partial<UserDocument> {
    const documentData: Partial<UserDocument> = {
      name: entity.name,
      email: entity.email,
    };

    if (entity.createdAt) {
      documentData.createdAt = entity.createdAt;
    }
    if (entity.updatedAt) {
      documentData.updatedAt = entity.updatedAt;
    }

    return documentData;
  }
}
