import { mongoose } from '../db/mongoose';

export interface ITodoDocument extends mongoose.Document {
  text: string,
  completed: boolean,
  completedAt: number,
  _creator: mongoose.Schema.Types.ObjectId,
}

const TodoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Number,
    default: null,
  },
  _creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  },
});

export default mongoose.model<ITodoDocument>('Todo', TodoSchema);
