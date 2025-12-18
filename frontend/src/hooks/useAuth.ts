import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAuth() {
     const queryClient = useQueryClient();

     const { data: user, isLoading } = useQuery({
          queryKey: ['auth', 'me'],
          queryFn: api.auth.me,
          staleTime: Infinity, // User session shouldn't change often in this prototype
     });

     const loginMutation = useMutation({
          mutationFn: ({ email, role }: { email: string, role: string }) => api.auth.login(email, role),
          onSuccess: (newUser) => {
               queryClient.setQueryData(['auth', 'me'], newUser);
          },
     });

     const logoutMutation = useMutation({
          mutationFn: api.auth.logout,
          onSuccess: () => {
               queryClient.clear();
               queryClient.setQueryData(['auth', 'me'], null);
          },
     });

     return {
          user,
          isLoading,
          login: loginMutation.mutateAsync,
          logout: logoutMutation.mutateAsync,
     };
}
