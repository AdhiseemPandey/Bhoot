export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  points: number;
}

export interface QuestionBank {
  id: string;
  title: string;
  description: string;
  owner: string;
  questions: Question[];
  isPublic: boolean;
  tags: string[];
  createdAt: string;
}

export interface Player {
  playerId: string;
  username: string;
  score: number;
}

export interface GameSession {
  id: string;
  pin: string;
  host: User;
  questionBank: QuestionBank;
  players: Player[];
  currentQuestion: number;
  status: 'waiting' | 'active' | 'finished';
  settings: {
    randomizeQuestions: boolean;
    showLeaderboard: boolean;
  };
}