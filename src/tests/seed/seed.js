import { ObjectID } from 'mongodb';
import jwt from 'jsonwebtoken';
import Todo from '../../models/todo';
import User from '../../models/user';

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString(),
      },
    ],
  },
  {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [
      {
        access: 'auth',
        token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString(),
      },
    ],
  },
];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId,
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId,
  },
];

const populateTodos = done =>
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done())
    .catch(err => console.log(err));

const populateUsers = done =>
  User.remove({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done())
    .catch(err => console.log(err));

module.exports = { todos, populateTodos, users, populateUsers };
