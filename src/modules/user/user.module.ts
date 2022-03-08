import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './user.schema';
import { HashingUtils } from '../../utils/hash.util';
import { UserService } from './user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.pre<UserDocument>('save', async function () {
            const hasher = new HashingUtils();

            this.password = await hasher.HashPassword(this);
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [UserService, AuthService],
  controllers: [AuthController],
})
export class UserModule {}
