import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    socketInstance = io(backendUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect_error', () => {
      // Gracefully handle reconnection when backend server is restarting or offline
    });
  }
  return socketInstance;
};
