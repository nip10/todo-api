import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Bluebird from 'bluebird';
import _ from 'lodash';

import logger from '../utils/logger';

dotenv.config();

const { NODE_ENV, MONGODB_URI, MONGODB_URI_TEST } = process.env;

if (_.isNil(MONGODB_URI)) {
  logger.log('error', 'You need to set a MONGODB_URI in the .env file');
  process.exit(1);
}
if (_.isNil(MONGODB_URI_TEST)) {
  logger.log('error', 'You need to set a MONGODB_URI in the .env file');
  process.exit(1);
}

const isTest = NODE_ENV === 'test';
const dburl = isTest ? MONGODB_URI_TEST : MONGODB_URI;

(mongoose as any).Promise = Bluebird;

const mongooseOptions = {
  reconnectTries: 10,
  useNewUrlParser: true,
};

mongoose.connect(dburl, mongooseOptions)
  .then(() => {
    logger.log('info', 'Connected to database.');
  }, (err: any) => {
    logger.log('error', 'Connection to the database failed. %s', err);
    process.exit(1);
  });

export { mongoose };
