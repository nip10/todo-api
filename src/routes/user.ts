import _ from 'lodash';
import { Router, Response, Request } from 'express';
import validator from 'validator';

import User, { IUserDocument } from '../models/user';
import authenticate from '../middleware/authenticate';

import logger from '../utils/logger';

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
  const body = _.pick(req.body, ['email', 'password']);
  if (!_.isString(body.email) || !validator.isEmail(body.email)) {
    return res.status(400).send({ error: 'Invalid email address' });
  }
  const user = new User(body);
  return user
    .save()
    .then(() => user.generateAuthToken())
    .then(token => {
      logger.info('New user signup:', user._id);
      res.header('x-auth', token).send(user)
    })
    .catch(err => res.status(400).send(err));
});

router.get('/me', authenticate, (req: Request, res: Response) => res.send(req.user));

router.post('/login', (req: Request, res: Response) => {
  const body = _.pick(req.body, ['email', 'password']);
  if (!_.isString(body.email) || !validator.isEmail(body.email)) {
    return res.status(400).send({ error: 'Invalid email address' });
  }
  body.email = validator.normalizeEmail(body.email);
  return User.schema.statics.findByCredentials(body.email, body.password)
    .then((user: IUserDocument) => user.generateAuthToken().then((token: string) => {
      logger.info('User logged in', user._id);
      return res.header('x-auth', token).send(user);
    }))
    .catch((err: any) => res.status(400).send());
});

router.delete('/me/token', authenticate, (req: Request, res: Response) =>
  req.user.removeAuthToken(req.token).then(() => res.status(200).send(), (err: any) => res.status(400).send())
);

export default router;
