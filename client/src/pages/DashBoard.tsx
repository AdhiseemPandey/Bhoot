import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { questionBankAPI, gameAPI } from '../services/api';

interface QuestionBank {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      const banks = await questionBankAPI.getAll();
      setQuestionBanks(banks);
    } catch (error) {
      console.error('Failed to fetch question banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (questionBankId: string) => {
    try {
      const settings = {
        randomizeQuestions: true,
        showLeaderboard: true,
        powerUps: false
      };
      
      const game = await gameAPI.create(questionBankId, settings);
      navigate(`/host/${questionBankId}`, { state: { gamePin: game.gamePin } });
    } catch (error) {
      console.error('Failed to create game:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quiz Platform</h1>
          <div className="flex items-center space-x-4">
            <Link to="/analytics" className="text-blue-500 hover:text-blue-600">
              Analytics
            </Link>
            <span className="text-gray-700">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Question Banks</h2>
          <Link
            to="/create-question-bank"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Create New Bank
          </Link>
        </div>

        {questionBanks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-500 mb-4">No question banks yet</h3>
            <p className="text-gray-400">Create your first question bank to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionBanks.map((bank) => (
              <div key={bank._id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{bank.title}</h3>
                <p className="text-gray-600 mb-4">{bank.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{bank.questions.length} questions</span>
                  <span>{new Date(bank.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => createGame(bank._id)}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                  >
                    Host Game
                  </button>
                  <Link
                    to={`/create-question-bank?edit=${bank._id}`}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 text-center"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Join a Game</h2>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter Game PIN"
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="gamePinInput"
            />
            <button
              onClick={() => {
                const pinInput = document.getElementById('gamePinInput') as HTMLInputElement;
                const pin = pinInput?.value;
                if (pin) {
                  navigate(`/play/${pin}`);
                }
              }}
              className="bg-purple-500 text-white px-6 py-2 rounded-r-lg hover:bg-purple-600"
            >
              Join
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;