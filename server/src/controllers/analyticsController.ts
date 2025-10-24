import { Request, Response } from 'express';
import GameSession from '../models/GameSession';
import QuestionBank from '../models/QuestionBank';

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const hostedGames = await GameSession.find({ host: userId });
    const questionBanks = await QuestionBank.find({ owner: userId });

    const totalGames = hostedGames.length;
    const totalPlayers = hostedGames.reduce((sum, game) => sum + game.players.length, 0);
    const totalQuestions = questionBanks.reduce((sum, bank) => sum + bank.questions.length, 0);

    const stats = {
      totalGames,
      totalPlayers,
      totalQuestionBanks: questionBanks.length,
      totalQuestions,
      averagePlayersPerGame: totalGames > 0 ? (totalPlayers / totalGames).toFixed(1) : 0,
      mostPopularBank: questionBanks.length > 0 ? 
        questionBanks.reduce((prev, current) => 
          (prev.questions.length > current.questions.length) ? prev : current
        ).title : 'None'
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user stats' });
  }
};

export const getGameAnalytics = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const userId = (req as any).user.id;

    const gameSession = await GameSession.findOne({ _id: gameId, host: userId })
      .populate('questionBank');

    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const analytics = {
      gameInfo: {
        pin: gameSession.pin,
        startedAt: gameSession.startedAt,
        endedAt: gameSession.endedAt,
        duration: gameSession.endedAt ? 
          (gameSession.endedAt.getTime() - gameSession.startedAt.getTime()) / 1000 : 0
      },
      playerPerformance: gameSession.players.map(player => ({
        username: player.username,
        score: player.score,
        correctAnswers: Array.from(player.answers.values()).filter(a => a.isCorrect).length,
        averageTime: Array.from(player.answers.values()).reduce((sum, a) => sum + a.timeTaken, 0) / 
          Array.from(player.answers.values()).length || 0
      })),
      questionStats: gameSession.questionBank.questions.map((question, index) => {
        const answers = gameSession.players.map(player => 
          player.answers.get(index.toString())
        ).filter(Boolean);

        const correctCount = answers.filter(a => a.isCorrect).length;
        const totalAttempts = answers.length;

        return {
          question: question.questionText,
          correctAnswer: question.options[question.correctAnswer],
          totalAttempts,
          correctCount,
          accuracy: totalAttempts > 0 ? (correctCount / totalAttempts * 100).toFixed(1) : 0,
          averageTime: answers.reduce((sum, a) => sum + a.timeTaken, 0) / totalAttempts || 0
        };
      })
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game analytics' });
  }
};