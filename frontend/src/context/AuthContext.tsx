"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const cleanBase = envUrl.replace(/\/$/, "").replace(/\/api\/v1$/, "");
  return `${cleanBase}/api/v1`;
};

const API_BASE = getApiBase();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const setAuthCookie = (t: string | null) => {
    if (typeof document !== "undefined") {
      if (t) {
        document.cookie = `opsforge_token=${t}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.cookie = "opsforge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      }
    }
  };

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("opsforge_token", newToken);
      localStorage.setItem("opsforge_user", JSON.stringify(newUser));
      setAuthCookie(newToken);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("opsforge_token");
      localStorage.removeItem("opsforge_user");
      setAuthCookie(null);
    }
    router.push("/");
  };

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("opsforge_token");
      const storedUser = localStorage.getItem("opsforge_user");

      if (!storedToken) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore
        }
      }

      // Candidate verify endpoints
      const candidateUrls = [
        "/api/v1/auth/me",
        `${API_BASE}/auth/me`,
      ];

      let verifiedUser: UserProfile | null = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            verifiedUser = await res.json();
            break;
          }
        } catch (err) {
          // ignore candidate error
        }
      }

      if (verifiedUser) {
        setUser(verifiedUser);
        localStorage.setItem("opsforge_user", JSON.stringify(verifiedUser));
        setAuthCookie(storedToken);
      } else {
        // Token invalid or expired
        localStorage.removeItem("opsforge_token");
        localStorage.removeItem("opsforge_user");
        setAuthCookie(null);
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const isAuthenticated = Boolean(token && user);

  // Route Protection & Navigation Guard
  useEffect(() => {
    if (isLoading) return;

    const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");
    const isLandingPage = pathname === "/";
    const isPublicPage = isLoginPage || isLandingPage;

    if (!isAuthenticated && !isPublicPage) {
      // Redirect unauthenticated user accessing protected routes directly to /login
      router.replace("/login");
    } else if (isAuthenticated && isPublicPage) {
      // Redirect authenticated user away from landing/login to main Dashboard (/incidents)
      router.replace("/incidents");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
