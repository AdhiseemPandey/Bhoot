import { Server, Socket } from 'socket.io';
import GameSession from '../models/GameSession';

export class PlayerSocketHandler {
  private io: Server;
  private playerConnections: Map<string, string> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupPlayerEvents();
  }

  private setupPlayerEvents() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Player connected:', socket.id);

      socket.on('player-join-game', async (data: { gamePin: string; playerId: string }) => {
        const { gamePin, playerId } = data;
        
        socket.join(`game-${gamePin}`);
        socket.join(`player-${playerId}`);
        this.playerConnections.set(playerId, socket.id);

        const gameSession = await GameSession.findOne({ pin: gamePin });
        if (gameSession) {
          socket.to(`host-${gamePin}`).emit('player-count-update', {
            playerCount: gameSession.players.length
          });
        }
      });

      socket.on('submit-answer', async (data: {
        gamePin: string;
        playerId: string;
        questionIndex: number;
        answerIndex: number;
        timeTaken: number;
      }) => {
        await this.handlePlayerAnswer(data);
      });

      socket.on('disconnect', () => {
        for (const [playerId, socketId] of this.playerConnections.entries()) {
          if (socketId === socket.id) {
            this.playerConnections.delete(playerId);
            break;
          }
        }
        console.log('Player disconnected:', socket.id);
      });
    });
  }

  private async handlePlayerAnswer(data: {
    gamePin: string;
    playerId: string;
    questionIndex: number;
    answerIndex: number;
    timeTaken: number;
  }) {
    const { gamePin, playerId, questionIndex, answerIndex, timeTaken } = data;

    try {
      const gameSession = await GameSession.findOne({ pin: gamePin }).populate('questionBank');
      if (!gameSession) return;

      const player = gameSession.players.find(p => p.playerId === playerId);
      const question = gameSession.questionBank.questions[questionIndex];

      if (!player || !question) return;

      const isCorrect = answerIndex === question.correctAnswer;
      let points = 0;

      if (isCorrect) {
        const timeFactor = Math.max(0, (question.timeLimit * 1000 - timeTaken)) / (question.timeLimit * 1000);
        points = Math.floor(question.points * timeFactor);
        player.score += points;
      }

      player.answers.set(questionIndex.toString(), {
        answerIndex,
        isCorrect,
        timeTaken,
        points: points
      });

      await gameSession.save();

      this.io.to(`host-${gamePin}`).emit('player-answered', {
        playerId,
        username: player.username,
        isCorrect,
        points,
        totalScore: player.score
      });

      this.io.to(`player-${playerId}`).emit('answer-received', {
        questionIndex,
        isCorrect,
        pointsEarned: points,
        correctAnswer: question.correctAnswer
      });

    } catch (error) {
      console.error('Error handling player answer:', error);
    }
  }

  getPlayerSocket(playerId: string): string | undefined {
    return this.playerConnections.get(playerId);
  }

  sendToPlayer(playerId: string, event: string, data: any) {
    const socketId = this.getPlayerSocket(playerId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  broadcastToGame(gamePin: string, event: string, data: any) {
    this.io.to(`game-${gamePin}`).emit(event, data);
  }
}