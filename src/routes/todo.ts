import { Router, Request, Response } from "express";
import _ from "lodash";
import { Types } from "mongoose";

import Todo from "../models/todo";
import authenticate from "../middleware/authenticate";

const router: Router = Router();

router.post("/", authenticate, async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!_.isString(text) || !text.length) {
    return res.status(400).json({ error: "Invalid text" });
  }
  const todo = new Todo({ text, _creator: req.user._id });
  try {
    const todoDoc = await todo.save();
    return res.json(todoDoc);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const todos = await Todo.find({ _creator: req.user._id });
    return res.json(todos);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const todo = await Todo.findOne({ _id: id, _creator: req.user._id });
    if (_.isNil(todo)) {
      return res.sendStatus(404);
    }
    return res.json(todo);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (_.isNil(todo)) {
      return res.sendStatus(404);
    }
    return res.json(todo);
  } catch (error) {
    return res.sendStatus(500);
  }
});

router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  const body = _.pick(req.body, ["text", "completed"]);
  if (body.completed && _.isBoolean(body.completed)) {
    _.assign(body, { completedAt: new Date().getTime() });
  } else {
    _.assign(body, { completedAt: null, completed: false });
  }
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true }
    );
    if (_.isNil(todo)) {
      return res.sendStatus(404);
    }
    return res.json(todo);
  } catch (error) {
    return res.sendStatus(500);
  }
});

export default router;
