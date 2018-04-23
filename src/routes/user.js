import express from 'express';
import _ from 'lodash';

import { User } from '../models/user';
import authenticate from '../middleware/authenticate';

const router = express.Router();

router.post('/', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);
  return user
    .save()
    .then(() => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(err => res.status(400).send(err));
});

router.get('/me', authenticate, (req, res) => res.send(req.user));

router.post('/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  return User.findByCredentials(body.email, body.password)
    .then(user => user.generateAuthToken().then(token => res.header('x-auth', token).send(user)))
    .catch(err => res.status(400).send());
});

router.delete('/me/token', authenticate, (req, res) =>
  req.user.removeToken(req.token).then(() => res.status(200).send(), err => res.status(400).send())
);

module.exports = router;
