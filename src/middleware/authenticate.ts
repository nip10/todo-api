import _ from "lodash";
import User, { IUserDocument } from "../models/user";
import { Request, Response, NextFunction } from "express";

// export type authenticate = (req: Request, res: Response, next: NextFunction) => Promise<void>

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth");
  if (_.isNil(token) || !_.isString(token)) {
    return res.sendStatus(401);
  }

  return User.findByToken(token)
    .then((user: IUserDocument) => {
      if (!user) {
        return Promise.reject();
      }
      req.user = user;
      req.token = token;
      return next();
    })
    .catch((err: any) => res.status(401).send());
};
