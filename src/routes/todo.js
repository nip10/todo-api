import express from 'express';
import _ from 'lodash';
import { ObjectID } from 'mongodb';

import { Todo } from '../models/todo';
import authenticate from '../middleware/authenticate';

const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });
  return todo.save().then(doc => res.send(doc), err => res.status(400).send(err));
});

router.get('/', authenticate, (req, res) =>
  Todo.find({
    _creator: req.user._id,
  }).then(todos => res.send({ todos }), err => res.status(400).send(err))
);

router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) return res.status(404).send();
  return Todo.findOne({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => {
      if (_.isNil(todo)) return res.status(404).send();
      return res.send({ todo });
    })
    .catch(err => res.status(400).send());
});

router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) return res.status(404).send();
  return Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => {
      if (_.isNil(todo)) return res.status(404).send();
      return res.send({ todo });
    })
    .catch(err => res.status(400).send());
});

router.patch('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) return res.status(404).send();
  const body = _.pick(req.body, ['text', 'completed']);
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  return Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true })
    .then(todo => {
      if (_.isNil(todo)) return res.status(404).send();
      return res.send({ todo });
    })
    .catch(err => res.status(400).send);
});

module.exports = router;
