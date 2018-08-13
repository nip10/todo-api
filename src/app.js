import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';

/* eslint-disable-next-line no-unused-vars */
import { mongoose } from './db/mongoose';

import user from './routes/user';
import todo from './routes/todo';

dotenv.config();

const { PORT, NODE_ENV } = process.env;
const isDev = NODE_ENV === 'development';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user', user);
app.use('/todo', todo);

// Handle 404s
app.use((req, res) => {
  const err = new Error('Page Not Found.');
  return res.status(404).json({ error: err });
});

// Handle server errors
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: isDev ? err : 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = { app };
