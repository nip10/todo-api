import _ from 'lodash';
import { User } from '../models/user';

const authenticate = (req, res, next) => {
  const token = req.header('x-auth');
  if (_.isNil(token) || !_.isString(token)) return res.sendStatus(401);
  return User.findByToken(token)
    .then(user => {
      if (!user) return Promise.reject();
      req.user = user;
      req.token = token;
      return next();
    })
    .catch(err => res.status(401).send());
};

module.exports = authenticate;
