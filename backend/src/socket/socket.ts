import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on('join:vote', (voteId: string) => {
      socket.join(`vote:${voteId}`);
    });

    socket.on('leave:vote', (voteId: string) => {
      socket.leave(`vote:${voteId}`);
    });

    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function emitVoteUpdate(voteId: string, data: any) {
  if (io) io.to(`vote:${voteId}`).emit('vote:updated', data);
}

export function emitNotification(userId: string, notification: any) {
  if (io) io.to(`user:${userId}`).emit('notification:new', notification);
}

export function emitLeaderboardUpdate(data: any) {
  if (io) io.emit('leaderboard:updated', data);
}

export function emitTicketCheckIn(data: any) {
  if (io) io.emit('ticket:checkedin', data);
}
