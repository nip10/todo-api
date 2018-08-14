import { mongoose } from '../db/mongoose';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

const { JWT_SECRET } = process.env;

if (_.isNil(JWT_SECRET)) {
  logger.log('error', 'You need to set a MONGODB_URI in the .env file');
  process.exit(1);
}

export interface IUserDocument extends mongoose.Document {
  password: string,
  tokens: any[],
  toJSON: () => void,
  removeAuthToken: (token: string) => Promise<void>,
  generateAuthToken: () => Promise<string>,
}

interface IUserModel extends mongoose.Model<IUserDocument> {
  findByToken: (token: string) => Promise<IUserDocument>,
  findByCredentials: (email: string, password: string) => Promise<IUserDocument>,
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

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  return _.pick(userObject, ['_id', 'email']);
};

// instance >> user
UserSchema.methods.generateAuthToken = function () {
  const user = this; // TODO: Replace the last 'user' by 'this'
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, JWT_SECRET).toString();

  this.tokens.push({ access, token });

  return this.save().then(() => token);
};

UserSchema.methods.removeAuthToken = function (token: string) {
  return this.update({
    $pull: {
      tokens: { token },
    },
  });
};

// model >> User
UserSchema.statics.findByToken = function (token: string) {
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return Promise.reject();
  }
  return this.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth",
  });
};

UserSchema.statics.findByCredentials = function (email: string, password: string) {
  return this.findOne({ email }).then((user: IUserDocument) => {
    if (!user) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err: mongoose.Error, isMatch: boolean) => {
        if (isMatch) {
          resolve(user);
        }
        reject();
      });
    });
  });
};

UserSchema.pre('save', function (this: IUserDocument, next) {
  if (!this.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(this.password, salt, (err2: mongoose.Error, hash) => {
      if (err2) { return next(err); }
      this.password = hash;
      next();
    });
  });

});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
export default User;
