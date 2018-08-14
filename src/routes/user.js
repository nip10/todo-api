import { Router } from 'express';
import _ from 'lodash';
import validator from 'validator';

import User from '../models/user';
import authenticate from '../middleware/authenticate';

import logger from '../utils/logger';

const router = Router();

router.post('/', (req, res) => {
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
      res.header('x-auth', token).send(user);
    })
    .catch(err => res.status(400).send(err));
});

router.get('/me', authenticate, (req, res) => res.send(req.user));

router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  if (!_.isString(body.email) || !validator.isEmail(body.email)) {
    return res.status(400).send({ error: 'Invalid email address' });
  }
  return User.findByCredentials(body.email, body.password)
    .then(user =>
      user.generateAuthToken().then(token => {
        logger.info('User logged in', user._id);
        return res.header('x-auth', token).send(user);
      })
    )
    .catch(err => res.status(400).send());
});

router.delete('/me/token', authenticate, (req, res) =>
  req.user.removeAuthToken(req.token).then(() => res.status(200).send(), err => res.status(400).send())
);

module.exports = router;
