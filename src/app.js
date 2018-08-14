import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';

import user from './routes/user';
import todo from './routes/todo';

dotenv.config();

const { PORT, NODE_ENV } = process.env;
const isProd = NODE_ENV === 'production';

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', user);
app.use('/todos', todo);

// Handle 404s
app.use((req, res) => {
  const err = new Error('Page Not Found.');
  return res.status(404).json({ error: err.message });
});

// Handle server errors
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  return res.status(500).json({ error: isProd ? 'Server error' : err });
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = { app };
