import api from './api';

export const analyticsAPI = {
  getUserStats: () => 
    api.get('/analytics/stats').then(res => res.data),

  getGameHistory: () => 
    api.get('/analytics/games').then(res => res.data),

  getGameAnalytics: (gameId: string) => 
    api.get(`/analytics/games/${gameId}`).then(res => res.data),

  exportGameData: (gameId: string) => 
    api.get(`/analytics/games/${gameId}/export`).then(res => res.data),
};