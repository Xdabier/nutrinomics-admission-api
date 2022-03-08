import { UserDocument } from '../modules/user/user.schema';
import { compare, genSalt, hash } from 'bcrypt';

interface Hasher {
  HashPassword(doc: UserDocument): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}

export class HashingUtils implements Hasher {
  async HashPassword(doc: UserDocument): Promise<string> {
    const salt = await genSalt(15);
    return await hash(doc.password, salt);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }
}
