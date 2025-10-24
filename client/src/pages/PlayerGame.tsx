import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import GameResults from '../components/GameResults';

interface GameQuestion {
  text: string;
  options: string[];
  timeLimit: number;
}

const PlayerGame: React.FC = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { playerId, username } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const { emit, on, off, isConnected } = useWebSocket({
    url: process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'
  });

  useEffect(() => {
    if (!playerId || !username) {
      navigate(`/play/${gamePin}`);
      return;
    }

    // Join the game
    emit('player-join-game', { gamePin, playerId });

    // Set up event listeners
    on('question-start', (data: any) => {
      setCurrentQuestion(data.question);
      setTimeLeft(data.question.timeLimit);
      setSelectedAnswer(null);
      setAnswered(false);
    });

    on('question-end', (data: any) => {
      setAnswered(true);
    });

    on('game-end', (data: any) => {
      setGameFinished(true);
      setFinalScore(score);
      setShowResults(true);
    });

    on('answer-received', (data: any) => {
      if (data.isCorrect) {
        setScore(prev => prev + data.pointsEarned);
      }
    });

    return () => {
      off('question-start');
      off('question-end');
      off('game-end');
      off('answer-received');
    };
  }, [gamePin, playerId, username, emit, on, off, navigate, score]);

  useEffect(() => {
    if (timeLeft > 0 && !answered && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuestion && !answered) {
      handleAnswer(-1); // Time's up
    }
  }, [timeLeft, answered, currentQuestion]);

  const handleAnswer = (answerIndex: number) => {
    if (answered || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setAnswered(true);

    const timeTaken = (currentQuestion.timeLimit - timeLeft) * 1000;
    
    emit('submit-answer', {
      gamePin,
      playerId,
      questionIndex: 0, // This would come from the server in real implementation
      answerIndex,
      timeTaken
    });
  };

  if (!playerId || !username) {
    return null;
  }

  if (showResults) {
    return (
      <GameResults
        results={{
          players: [{ username, score: finalScore, correctAnswers: Math.floor(finalScore / 100) }],
          totalQuestions: 10,
          gameDuration: 600
        }}
        onPlayAgain={() => window.location.reload()}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Waiting for game to start...</h1>
          <p className="text-xl">Hello, {username}!</p>
          <p className="text-lg text-gray-600 mt-2">Game PIN: {gamePin}</p>
          <div className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
      </div>
    );
  }

  const getOptionColor = (index: number) => {
    if (!answered) {
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
    
    if (index === selectedAnswer) {
      return selectedAnswer === 0 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white';
    }
    
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">{username}</h1>
          <div className="text-xl font-semibold">Score: {score}</div>
          <div className="text-xl font-semibold">
            Time: <span className={timeLeft <= 5 ? 'text-red-300 animate-pulse' : ''}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">{currentQuestion.text}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`p-4 rounded-lg text-lg font-semibold text-center transition-all ${getOptionColor(index)}`}
              >
                {option}
              </button>
            ))}
          </div>

          {answered && (
            <div className="mt-6 text-center">
              <p className="text-lg">
                {selectedAnswer !== null ? 
                  'Answer submitted! Waiting for next question...' : 
                  'Time\'s up! Waiting for next question...'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerGame;