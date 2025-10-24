import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameResultsProps {
  results: {
    players: Array<{
      username: string;
      score: number;
      correctAnswers: number;
    }>;
    totalQuestions: number;
    gameDuration: number;
  };
  onPlayAgain?: () => void;
}

const GameResults: React.FC<GameResultsProps> = ({ results, onPlayAgain }) => {
  const navigate = useNavigate();
  const { players, totalQuestions, gameDuration } = results;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Game Results
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{sortedPlayers.length}</div>
            <div className="text-gray-600">Players</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
            <div className="text-gray-600">Questions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.floor(gameDuration / 60)}:{(gameDuration % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-gray-600">Duration</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Final Leaderboard</h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.username}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-400 bg-gray-50' :
                  index === 2 ? 'border-orange-400 bg-orange-50' :
                  'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold">
                    {getMedal(index)}
                  </span>
                  <div>
                    <div className={index < 3 ? 'font-bold text-lg' : 'text-base'}>
                      {player.username}
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.correctAnswers}/{totalQuestions} correct
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {player.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {((player.correctAnswers / totalQuestions) * 100).toFixed(1)}% accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold"
            >
              Play Again
            </button>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResults;