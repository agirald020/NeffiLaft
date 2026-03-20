import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types/User";
import { AuthContextType } from "../types/AuthContext";


export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthQuery() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        
        return response.json();
      } catch (error) {
        console.error("Auth query error:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const login = () => {
    window.location.href = "/auth/login";
  };

  const logout = async () => {
    try {
      await fetch("/auth/logout", {
        method: "GET",
        credentials: 'include',
      });
      
      // Clear all queries and redirect
      queryClient.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      queryClient.clear();
      window.location.href = "/";
    }
  };

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error: error as Error | null
  };
}