"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/api";
import { authApi, LoginPayload, RegisterPayload } from "@/services/auth.api";
import { apiClient } from "@/services/api-client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("devsphere_token") : null;
        if (!token) {
          setIsLoading(false);
          return;
        }

        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          apiClient.removeToken();
          setUser(null);
        }
      } catch {
        apiClient.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return { success: true };
      } else {
        return { success: false, error: res.message || "Failed to sign in" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        setUser(res.data.user);
        return { success: true };
      } else {
        return { success: false, error: res.message || "Failed to register" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
