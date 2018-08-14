/* eslint-disable func-names */

import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { mongoose } from '../db/mongoose';
import logger from '../utils/logger';

const { JWT_SECRET } = process.env;

if (_.isNil(JWT_SECRET)) {
  logger.log('error', 'You need to set a MONGODB_URI in the .env file');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    minlength: 6,
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

// instance >> user
UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, JWT_SECRET).toString();

  this.tokens.push({ access, token });

  return this.save().then(() => token);
};

UserSchema.methods.removeAuthToken = function(token) {
  return this.update({
    $pull: {
      tokens: { token },
    },
  });
};

// model >> User
UserSchema.statics.findByToken = function(token) {
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return Promise.reject();
  }
  return this.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  return this.findOne({ email }).then(user => {
    if (!user) return Promise.reject();
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (isMatch) resolve(user);
        reject();
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (err2, hash) => {
        this.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('User', UserSchema);
