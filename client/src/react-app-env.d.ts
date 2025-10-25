/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_SERVER_URL: string;
  }
}

// Socket.io client types
interface SocketEvents {
  'player-joined': (data: any) => void;
  'player-answered': (data: any) => void;
  'question-start': (data: any) => void;
  'question-end': (data: any) => void;
  'game-end': (data: any) => void;
  'answer-received': (data: any) => void;
}