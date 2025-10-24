import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer {
  playerId: string;
  username: string;
  score: number;
  answers: Map<string, {
    answerIndex: number;
    isCorrect: boolean;
    timeTaken: number;
    points: number;
  }>;
}

export interface IGameSession extends Document {
  pin: string;
  host: mongoose.Types.ObjectId;
  questionBank: mongoose.Types.ObjectId;
  players: IPlayer[];
  currentQuestion: number;
  status: 'waiting' | 'active' | 'finished';
  settings: {
    randomizeQuestions: boolean;
    showLeaderboard: boolean;
    powerUps: boolean;
  };
  startedAt: Date;
  endedAt: Date;
}

const PlayerSchema: Schema = new Schema({
  playerId: { type: String, required: true },
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  answers: {
    type: Map,
    of: new Schema({
      answerIndex: Number,
      isCorrect: Boolean,
      timeTaken: Number,
      points: Number
    }),
    default: new Map()
  }
});

const GameSessionSchema: Schema = new Schema({
  pin: { type: String, required: true, unique: true },
  host: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  questionBank: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  players: [PlayerSchema],
  currentQuestion: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['waiting', 'active', 'finished'], 
    default: 'waiting' 
  },
  settings: {
    randomizeQuestions: { type: Boolean, default: false },
    showLeaderboard: { type: Boolean, default: true },
    powerUps: { type: Boolean, default: false }
  },
  startedAt: Date,
  endedAt: Date
}, { timestamps: true });

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);