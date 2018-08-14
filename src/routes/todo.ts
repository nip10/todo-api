import { Router, Request, Response } from 'express';
import _ from 'lodash';
import { ObjectID } from 'mongodb';

import Todo from '../models/todo';
import authenticate from '../middleware/authenticate';

const router: Router = Router();

router.post('/', authenticate, (req: Request, res: Response) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });
  return todo.save().then(doc => res.send(doc), (err: any) => res.status(400).send(err));
});

router.get('/', authenticate, (req: Request, res: Response) =>
  Todo.find({
    _creator: req.user._id,
  }).then(todos => res.send({ todos }), (err: any) => res.status(400).send(err))
);

router.get('/:id', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  return Todo.findOne({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => {
      if (_.isNil(todo)) {
        return res.status(404).send();
      }
      return res.send({ todo });
    })
    .catch((err: any) => res.status(400).send());
});

router.delete('/:id', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  return Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id,
  })
    .then(todo => {
      if (_.isNil(todo)) {
        return res.status(404).send();
      }
      return res.send({ todo });
    })
    .catch((err: any) => res.status(400).send());
});

router.patch('/:id', authenticate, (req: Request, res: Response) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  const body = _.pick(req.body, ['text', 'completed']);
  if (_.isBoolean(body.completed) && body.completed) {
    _.assign(body, { completedAt: new Date().getTime() });
  } else {
    _.assign(body, { completedAt: null, completed: false });
  }
  return Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true })
    .then(todo => {
      if (_.isNil(todo)) {
        return res.status(404).send();
      }
      return res.send({ todo });
    })
    .catch((err: any) => res.status(400).send);
});

export default router;
