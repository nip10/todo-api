import { mongoose } from '../db/mongoose';

const Todo = new mongoose.Schema({
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

export default mongoose.model('Todo', Todo);
