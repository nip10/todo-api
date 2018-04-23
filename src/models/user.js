/* eslint-disable func-names */

import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';

const { JWT_SECRET } = process.env;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
    },
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
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// instance >> user
UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, JWT_SECRET).toString();

  user.tokens.push({ access, token });

  return user.save().then(() => token);
};

UserSchema.methods.removeToken = function(token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: { token },
    },
  });
};

// model >> User
UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  const User = this;
  return User.findOne({ email }).then(user => {
    if (!user) return Promise.reject();
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) resolve(user);
        reject();
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err2, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
