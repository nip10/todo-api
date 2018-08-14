import { IUserDocument } from '../models/user';

declare global {
  namespace Express {
    export interface Request {
      user?: IUserDocument,
      token?: string,
    }
  }
}