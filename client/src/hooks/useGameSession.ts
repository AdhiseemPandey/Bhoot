import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { gameAPI } from '../services/api';

interface GameSessionState {
  players: any[];
  currentQuestion: number;
  gameState: 'waiting' | 'active' | 'finished';
  leaderboard: any[];
}

export const useGameSession = (gamePin: string, role: 'host' | 'player') => {
  const [sessionState, setSessionState] = useState<GameSessionState>({
    players: [],
    currentQuestion: 0,
    gameState: 'waiting',
    leaderboard: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { socket, isConnected, emit, on, off } = useWebSocket({
    url: process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'
  });

  useEffect(() => {
    if (!isConnected) return;

    if (role === 'host') {
      emit('host-join', { gamePin });
    }

    on('player-joined', (data: any) => {
      setSessionState(prev => ({
        ...prev,
        players: [...prev.players, data.player]
      }));
    });

    on('player-answered', (data: any) => {
      setSessionState(prev => ({
        ...prev,
        players: prev.players.map(player =>
          player.playerId === data.playerId
            ? { ...player, score: data.totalScore }
            : player
        )
      }));
    });

    on('question-start', (data: any) => {
      setSessionState(prev => ({
        ...prev,
        currentQuestion: data.questionIndex,
        gameState: 'active'
      }));
    });

    on('question-end', (data: any) => {
      setSessionState(prev => ({
        ...prev,
        leaderboard: data.leaderboard
      }));
    });

    on('game-end', (data: any) => {
      setSessionState(prev => ({
        ...prev,
        gameState: 'finished',
        leaderboard: data.leaderboard
      }));
    });

    return () => {
      off('player-joined');
      off('player-answered');
      off('question-start');
      off('question-end');
      off('game-end');
    };
  }, [isConnected, gamePin, role, emit, on, off]);

  const startGame = () => {
    emit('start-game', { gamePin });
  };

  const submitAnswer = (playerId: string, questionIndex: number, answerIndex: number, timeTaken: number) => {
    emit('submit-answer', {
      gamePin,
      playerId,
      questionIndex,
      answerIndex,
      timeTaken
    });
  };

  return {
    sessionState,
    loading,
    error,
    isConnected,
    startGame,
    submitAnswer
  };
};