import { Server } from 'socket.io';
import GameSession from '../models/GameSession';

export class GameSocketHandler {
  private io: Server;
  private activeGames: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('host-join', async (data: { gamePin: string }) => {
        socket.join(`game-${data.gamePin}`);
        socket.join(`host-${data.gamePin}`);
      });

      socket.on('player-join', async (data: { gamePin: string; playerId: string }) => {
        socket.join(`game-${data.gamePin}`);
        socket.join(`player-${data.playerId}`);
        
        socket.to(`host-${data.gamePin}`).emit('player-joined', {
          playerId: data.playerId
        });
      });

      socket.on('start-game', async (data: { gamePin: string }) => {
        const gameSession = await GameSession.findOne({ pin: data.gamePin });
        if (gameSession) {
          gameSession.status = 'active';
          gameSession.startedAt = new Date();
          await gameSession.save();

          this.startQuestion(data.gamePin, 0);
        }
      });

      socket.on('player-answer', async (data: any) => {
        await this.handlePlayerAnswer(data);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  private async startQuestion(gamePin: string, questionIndex: number) {
    const gameSession = await GameSession.findOne({ pin: gamePin }).populate('questionBank');
    if (!gameSession) return;

    const questions = gameSession.questionBank.questions;
    if (questionIndex >= questions.length) {
      this.endGame(gamePin);
      return;
    }

    const question = questions[questionIndex];
    
    this.io.to(`game-${gamePin}`).emit('question-start', {
      questionIndex,
      question: {
        text: question.questionText,
        options: question.options,
        timeLimit: question.timeLimit
      }
    });

    const timer = setTimeout(() => {
      this.endQuestion(gamePin, questionIndex);
    }, question.timeLimit * 1000);

    this.activeGames.set(gamePin, timer);
  }

  private async endQuestion(gamePin: string, questionIndex: number) {
    const gameSession = await GameSession.findOne({ pin: gamePin }).populate('questionBank');
    if (!gameSession) return;

    const question = gameSession.questionBank.questions[questionIndex];
    
    this.io.to(`game-${gamePin}`).emit('question-end', {
      questionIndex,
      correctAnswer: question.correctAnswer,
      leaderboard: gameSession.players
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
    });

    setTimeout(() => {
      this.startQuestion(gamePin, questionIndex + 1);
    }, 5000);
  }

  private async handlePlayerAnswer(data: any) {
    const { playerId, questionIndex, answerIndex, timeTaken } = data;
    
    const gameSession = await GameSession.findOne({
      'players.playerId': playerId
    }).populate('questionBank');

    if (!gameSession) return;

    const player = gameSession.players.find(p => p.playerId === playerId);
    const question = gameSession.questionBank.questions[questionIndex];
    
    if (!player || !question) return;

    const isCorrect = answerIndex === question.correctAnswer;
    let points = 0;

    if (isCorrect) {
      const timeFactor = (question.timeLimit * 1000 - timeTaken) / (question.timeLimit * 1000);
      points = Math.floor(question.points * timeFactor);
      player.score += points;
    }

    player.answers.set(questionIndex.toString(), {
      answerIndex,
      isCorrect,
      timeTaken,
      points
    });

    await gameSession.save();

    this.io.to(`host-${gameSession.pin}`).emit('answer-received', {
      playerId,
      username: player.username,
      isCorrect,
      points
    });
  }

  private async endGame(gamePin: string) {
    const gameSession = await GameSession.findOne({ pin: gamePin });
    if (gameSession) {
      gameSession.status = 'finished';
      gameSession.endedAt = new Date();
      await gameSession.save();

      const finalLeaderboard = gameSession.players
        .sort((a, b) => b.score - a.score)
        .map(player => ({
          username: player.username,
          score: player.score
        }));

      this.io.to(`game-${gamePin}`).emit('game-end', {
        leaderboard: finalLeaderboard
      });

      const timer = this.activeGames.get(gamePin);
      if (timer) {
        clearTimeout(timer);
        this.activeGames.delete(gamePin);
      }
    }
  }
}