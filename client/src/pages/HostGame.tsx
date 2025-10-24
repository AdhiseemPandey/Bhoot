import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGameSession } from '../hooks/useGameSession';
import GameResults from '../components/GameResults';

const HostGame: React.FC = () => {
  const { questionBankId } = useParams<{ questionBankId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [gamePin] = useState(location.state?.gamePin);
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);

  const { sessionState, isConnected, startGame } = useGameSession(gamePin, 'host');

  useEffect(() => {
    if (sessionState.gameState === 'finished') {
      // Fetch final results and show results page
      setShowResults(true);
      // In a real app, you would fetch the actual results from the API
      setGameResults({
        players: sessionState.players.map((p: any) => ({
          username: p.username,
          score: p.score,
          correctAnswers: Math.floor(Math.random() * 10) // Mock data
        })),
        totalQuestions: 10, // Mock data
        gameDuration: 600 // Mock data
      });
    }
  }, [sessionState.gameState, sessionState.players]);

  if (!gamePin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">Game PIN not found</div>
      </div>
    );
  }

  if (showResults && gameResults) {
    return (
      <GameResults
        results={gameResults}
        onPlayAgain={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Game PIN</h1>
          <div className="text-6xl font-bold text-gray-800 mb-4 font-mono">{gamePin}</div>
          <p className="text-xl text-gray-600">
            {sessionState.gameState === 'waiting' ? 'Waiting for players to join...' :
             sessionState.gameState === 'active' ? 'Game in progress...' : 'Game finished'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Players List */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Players ({sessionState.players.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessionState.players.map((player: any, index: number) => (
                <div
                  key={player.playerId}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow border"
                >
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-3">{index + 1}.</span>
                    <span className="text-lg">{player.username}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{player.score}</span>
                </div>
              ))}
              {sessionState.players.length === 0 && (
                <p className="text-center text-gray-500 py-8">No players joined yet</p>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Game Controls</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Game Status:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {sessionState.gameState}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Current Question:</span>
                  <span className="text-lg font-bold">{sessionState.currentQuestion + 1}</span>
                </div>
              </div>
            </div>

            {sessionState.gameState === 'waiting' && (
              <button
                onClick={startGame}
                disabled={sessionState.players.length === 0 || !isConnected}
                className="w-full bg-green-500 text-white py-4 rounded-lg text-xl font-semibold hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                Start Game ({sessionState.players.length} players)
              </button>
            )}

            {sessionState.gameState === 'active' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-4">
                  Question {sessionState.currentQuestion + 1} Active
                </div>
                <div className="text-lg text-gray-600">
                  Players are answering...
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        {sessionState.leaderboard.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 border">
            <h3 className="text-2xl font-bold mb-4 text-center">Current Leaderboard</h3>
            <div className="space-y-3">
              {sessionState.leaderboard.slice(0, 5).map((player: any, index: number) => (
                <div
                  key={player.playerId}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border-2 border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border-2 border-gray-200' :
                    index === 2 ? 'bg-orange-50 border-2 border-orange-200' :
                    'bg-gray-50 border'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`font-bold mr-3 ${
                      index === 0 ? 'text-2xl' :
                      index === 1 ? 'text-xl' :
                      index === 2 ? 'text-lg' : 'text-base'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <span className={`${
                      index < 3 ? 'font-semibold' : ''
                    }`}>
                      {player.username}
                    </span>
                  </div>
                  <span className="font-bold text-green-600">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostGame;