import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, getQueryFn } from "@/lib/queryClient";
import type { AuthState } from "@shared/schema";

export function useAuth() {
  const { data, isLoading } = useQuery<AuthState>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 30000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      return res.json();
    },
    onSuccess: (data: { logoutUrl: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      if (data.logoutUrl) {
        window.location.href = data.logoutUrl;
      }
    },
  });

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    user: data?.user ?? null,
    isLoading,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}
