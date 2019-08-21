import { mongoose } from "../db/mongoose";
import jwt from "jsonwebtoken";
import _ from "lodash";
import bcrypt from "bcrypt";
import logger from "../utils/logger";

const { JWT_SECRET } = process.env;

if (_.isNil(JWT_SECRET)) {
  logger.log("error", "You need to set a MONGODB_URI in the .env file");
  process.exit(1);
}

export interface IUserDocument extends mongoose.Document {
  password: string;
  tokens: any[];
  toJSON: () => void;
  removeAuthToken: (token: string) => Promise<void>;
  generateAuthToken: () => Promise<string>;
}

interface IUserModel extends mongoose.Model<IUserDocument> {
  findByToken: (token: string) => Promise<IUserDocument>;
  findByCredentials: (
    email: string,
    password: string
  ) => Promise<IUserDocument>;
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return _.pick(userObject, ["_id", "email"]);
};

// instance >> user
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  const access = "auth";
  const token = jwt
    .sign({ _id: user._id.toHexString(), access }, JWT_SECRET)
    .toString();
  this.tokens.push({ access, token });
  try {
    await this.save();
    return token;
  } catch (error) {
    return Promise.reject();
  }
};

UserSchema.methods.removeAuthToken = function(token: string) {
  return this.updateOne({
    $pull: {
      tokens: { token }
    }
  });
};

// model >> User
UserSchema.statics.findByToken = function(token: string) {
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return Promise.reject();
  }
  return this.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.statics.findByCredentials = async function(
  email: string,
  password: string
) {
  const user = await this.findOne({ email });
  if (!user) {
    return Promise.reject();
  }
  const isMatch = bcrypt.compare(password, user.password);
  return isMatch ? Promise.resolve(user) : Promise.reject("Invalid credentials");
};

// @ts-ignore
UserSchema.pre<IUserDocument>("save", async function(this: IUserDocument) {
  if (!this.isModified("password")) {
    return Promise.reject();
  }
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  return Promise.resolve();
});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>(
  "User",
  UserSchema
);

export default User;
