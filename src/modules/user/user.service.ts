import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(payload: Omit<UserDto, '_id'>): Promise<User> {
    return await this.userModel.create(payload);
  }

  async findOne(payload: Partial<UserDto>, isCurrent = false): Promise<User> {
    return await this.userModel
      .findOne(payload, isCurrent ? '-password' : '')
      .exec();
  }
}
