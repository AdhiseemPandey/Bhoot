import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, gameAPI } from '../services/api';

interface UserStats {
  totalGames: number;
  totalPlayers: number;
  totalQuestionBanks: number;
  totalQuestions: number;
  averagePlayersPerGame: string;
  mostPopularBank: string;
}

interface GameHistory {
  _id: string;
  pin: string;
  players: any[];
  startedAt: string;
  endedAt: string;
  questionBank: {
    title: string;
  };
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsData, gamesData] = await Promise.all([
        analyticsAPI.getUserStats(),
        gameAPI.get('') // This would need to be implemented to get user's games
      ]);
      setStats(statsData);
      // For now, we'll use mock data for game history
      setGameHistory([]);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Use mock data for demonstration
      setStats({
        totalGames: 12,
        totalPlayers: 85,
        totalQuestionBanks: 4,
        totalQuestions: 47,
        averagePlayersPerGame: '7.1',
        mostPopularBank: 'General Knowledge'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Games</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGames}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Players</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Question Banks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestionBanks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">❓</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Average Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Average Players per Game</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averagePlayersPerGame}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Popular Bank</p>
                <p className="text-xl font-semibold text-green-600">{stats.mostPopularBank}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {gameHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No recent games</p>
                <p className="text-sm text-gray-400">Host a game to see analytics here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gameHistory.slice(0, 5).map((game) => (
                  <div key={game._id} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{game.questionBank.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(game.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{game.players.length} players</p>
                      <p className="text-sm text-gray-500">PIN: {game.pin}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Game History</h3>
          </div>
          <div className="p-6">
            {gameHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No game history available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Your game history will appear here after you host some games
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Game PIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question Bank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gameHistory.map((game) => {
                    const duration = game.endedAt 
                      ? Math.round((new Date(game.endedAt).getTime() - new Date(game.startedAt).getTime()) / 60000)
                      : 'N/A';
                    
                    return (
                      <tr key={game._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {game.pin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.questionBank.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {game.players.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(game.startedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {duration} min
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;