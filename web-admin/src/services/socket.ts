import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  socket = io(apiUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinVoteRoom(voteId: string) {
  socket?.emit('join:vote', voteId);
}

export function leaveVoteRoom(voteId: string) {
  socket?.emit('leave:vote', voteId);
}

export function joinUserRoom(userId: string) {
  socket?.emit('join:user', userId);
}

/**
 * Join the admin room. Receives notifications for ALL users in the system
 * (payments, new signups, content reports, etc.) — admin-only broadcast.
 */
export function joinAdminRoom() {
  socket?.emit('join:admin');
}

export function leaveAdminRoom() {
  socket?.emit('leave:admin');
}

export function onVoteUpdated(callback: (data: any) => void) {
  socket?.on('vote:updated', callback);
  return () => socket?.off('vote:updated', callback);
}

export function onNotificationNew(callback: (data: any) => void) {
  socket?.on('notification:new', callback);
  return () => socket?.off('notification:new', callback);
}

export function onLeaderboardUpdated(callback: (data: any) => void) {
  socket?.on('leaderboard:updated', callback);
  return () => socket?.off('leaderboard:updated', callback);
}

export function onTicketCheckedIn(callback: (data: any) => void) {
  socket?.on('ticket:checkedin', callback);
  return () => socket?.off('ticket:checkedin', callback);
}

export function onUserActivity(callback: (data: any) => void) {
  socket?.on('user:activity', callback);
  return () => socket?.off('user:activity', callback);
}
