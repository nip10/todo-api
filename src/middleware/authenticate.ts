import _ from 'lodash';
import User from '../models/user';
import { Request, Response, NextFunction } from 'express';

// export type authenticate = (req: Request, res: Response, next: NextFunction) => Promise<void>

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth');
  if (_.isNil(token) || !_.isString(token)) {
    return res.sendStatus(401);
  }
  try {
    const user = await User.findByToken(token);
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return res.sendStatus(401);
  }
};
