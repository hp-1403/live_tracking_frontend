import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

const getSocketUrl = (): string => {
  const backend = (import.meta.env.VITE_BACKEND_URL || '').trim();
  if (backend) return backend.replace(/\/+$/, '');

  const api = (import.meta.env.VITE_API_URL || '').trim();
  if (api) {
    // Strip trailing /api or /api/
    return api.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }

  return typeof window !== 'undefined' ? window.location.origin : '';
};

export const getSocket = (): Socket => {
  if (!socketInstance) {
    const backendUrl = getSocketUrl();
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

export const disconnectSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
