import { Server } from 'socket.io';
import { GameSocketHandler } from '../sockets/gameSocket';
import { PlayerSocketHandler } from '../sockets/playerSocket';

export const setupSocketIO = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  new GameSocketHandler(io);
  new PlayerSocketHandler(io);

  return io;
};