import _ from 'lodash';
import { Router, Response, Request } from 'express';
import validator from 'validator';

import User from '../models/user';
import authenticate from '../middleware/authenticate';

import logger from '../utils/logger';

const router: Router = Router();

router.post('/', async (req: Request, res: Response) => {
  const body = _.pick(req.body, ['email', 'password']);
  if (!_.isString(body.email) || !validator.isEmail(body.email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  const user = new User(body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    logger.info('New user signup:', user._id);
    return res
      .status(201)
      .header('x-auth', token)
      .json(user);
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB 11000 = duplicate record
      return res.status(400).json({ error: 'Email already registred' });
    }
    return res.sendStatus(500);
  }
});

router.get('/me', authenticate, (req: Request, res: Response) => res.json(req.user));

router.post('/login', async (req: Request, res: Response) => {
  const body = _.pick(req.body, ['email', 'password']);
  if (!_.isString(body.email) || !validator.isEmail(body.email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  body.email = validator.normalizeEmail(body.email);
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    logger.info('User logged in', user._id);
    return res.header('x-auth', token).json(user);
  } catch (error) {
    if (error) {
      return res.status(400).json({ error });
    }
    return res.sendStatus(500);
  }
});

router.delete('/me/token', authenticate, async (req: Request, res: Response) => {
  try {
    await req.user!.removeAuthToken(req.token!);
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(400);
  }
});

export default router;
