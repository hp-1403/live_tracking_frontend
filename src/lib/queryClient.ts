import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      const msg = error?.message || 'Error occurred while loading data.';
      toast.error(msg, { id: msg });
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (data: any) => {
      if (data && typeof data === 'object' && data.message) {
        toast.success(data.message, { id: data.message });
      }
    },
    onError: (error: any) => {
      const msg = error?.message || 'Operation failed.';
      toast.error(msg, { id: msg });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 10, // 10 minutes cache retention
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
