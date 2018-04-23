import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { NODE_ENV, MONGODB_URI, MONGODB_URI_TEST } = process.env;
const isTest = NODE_ENV === 'test';
const dburl = isTest ? MONGODB_URI_TEST : MONGODB_URI;

mongoose.Promise = global.Promise;
mongoose.connect(dburl, {
  keepAlive: true,
  reconnectTries: 10,
});

module.exports = { mongoose };
