import { IUser } from '../app/models/users.model';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
