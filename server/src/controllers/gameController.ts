import { Request, Response } from 'express';
import GameSession from '../models/GameSession';
import QuestionBank from '../models/QuestionBank';
import { GamePinGenerator } from '../utils/gamePinGenerator';
import { QuestionRandomizer } from '../utils/questionRandomizer';

export const createGameSession = async (req: Request, res: Response) => {
  try {
    const { questionBankId, settings } = req.body;
    const hostId = (req as any).user.id;

    const questionBank = await QuestionBank.findById(questionBankId);
    if (!questionBank) {
      return res.status(404).json({ error: 'Question bank not found' });
    }

    let questions = questionBank.questions;
    if (settings.randomizeQuestions) {
      questions = QuestionRandomizer.selectRandomQuestions(
        questions, 
        Math.min(questions.length, 20)
      );
    }

    questions = QuestionRandomizer.shuffleOptions(questions);

    const gameSession = new GameSession({
      pin: GamePinGenerator.generate(),
      host: hostId,
      questionBank: questionBankId,
      settings,
      players: []
    });

    await gameSession.save();

    res.status(201).json({
      gamePin: gameSession.pin,
      sessionId: gameSession._id,
      questions: questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        timeLimit: q.timeLimit,
        points: q.points
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game session' });
  }
};

export const joinGameSession = async (req: Request, res: Response) => {
  try {
    const { pin, username } = req.body;

    const gameSession = await GameSession.findOne({ pin, status: 'waiting' });
    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found or already started' });
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    gameSession.players.push({
      playerId,
      username,
      score: 0,
      answers: new Map()
    });

    await gameSession.save();

    res.json({
      playerId,
      sessionId: gameSession._id,
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join game' });
  }
};

export const getGameSession = async (req: Request, res: Response) => {
  try {
    const { pin } = req.params;
    const gameSession = await GameSession.findOne({ pin })
      .populate('questionBank')
      .populate('host', 'username');

    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(gameSession);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game session' });
  }
};

export const startGame = async (req: Request, res: Response) => {
  try {
    const { pin } = req.params;
    const gameSession = await GameSession.findOne({ pin }).populate('questionBank');

    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (gameSession.host.toString() !== (req as any).user.id) {
      return res.status(403).json({ error: 'Only host can start the game' });
    }

    gameSession.status = 'active';
    gameSession.startedAt = new Date();
    await gameSession.save();

    res.json({ message: 'Game started successfully', gameSession });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game' });
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const { pin } = req.params;
    const gameSession = await GameSession.findOne({ pin });

    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found' });
    }

    gameSession.status = 'finished';
    gameSession.endedAt = new Date();
    await gameSession.save();

    res.json({ message: 'Game ended successfully', finalScores: gameSession.players });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end game' });
  }
};

export const getGameResults = async (req: Request, res: Response) => {
  try {
    const { pin } = req.params;
    const gameSession = await GameSession.findOne({ pin })
      .populate('questionBank')
      .populate('host', 'username');

    if (!gameSession) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const results = {
      gamePin: gameSession.pin,
      host: gameSession.host,
      questionBank: gameSession.questionBank,
      players: gameSession.players
        .sort((a, b) => b.score - a.score)
        .map(player => ({
          username: player.username,
          score: player.score,
          correctAnswers: Array.from(player.answers.values()).filter(a => a.isCorrect).length
        })),
      totalQuestions: gameSession.questionBank.questions.length,
      gameDuration: gameSession.endedAt ? 
        (gameSession.endedAt.getTime() - gameSession.startedAt.getTime()) / 1000 : 0
    };

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game results' });
  }
};