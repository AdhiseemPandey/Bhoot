import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export interface IQuestionBank extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  questions: IQuestion[];
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
}

const QuestionSchema: Schema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  timeLimit: { type: Number, default: 20 },
  points: { type: Number, default: 1000 }
});

const QuestionBankSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [QuestionSchema],
  isPublic: { type: Boolean, default: false },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IQuestionBank>('QuestionBank', QuestionBankSchema);