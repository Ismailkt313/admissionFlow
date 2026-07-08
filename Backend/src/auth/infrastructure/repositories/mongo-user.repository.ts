import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    if (!doc) {
      return null;
    }
    return this.toDomain(doc);
  }

  async create(user: User): Promise<User> {
    const created = new this.userModel({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    });
    const saved = await created.save();
    return this.toDomain(saved);
  }

  private toDomain(doc: any): User {
    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.password,
      doc.role,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
