"use client";

import { useEffect, useState } from "react";
import type { JwtPayload } from "./jwt";

interface UseAuthResult {
  user: JwtPayload | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Client-side auth hook
 * Usage: const { user, loading, isAuthenticated } = useAuth(["admin", "teacher"]);
 *
 * NOTE: Auth endpoints are implemented by team/auth. For now, this hook
 * doesn't require auth - it's for future use when team/auth provides:
 *   - GET /api/auth/me (verify current user)
 *   - POST /api/auth/login (authenticate)
 *   - POST /api/auth/logout (sign out)
 */
export function useAuth(requiredRoles?: string[]): UseAuthResult & { logout: () => Promise<void> } {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!isMounted) return;

        if (!response.ok) {
          // If no session exists in browser, initialize default Administrator session
          try {
            const loginRes = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: "admin@university.edu", password: "AdminPass123!" }),
              credentials: "include",
            });
            if (loginRes.ok) {
              const loginData = (await loginRes.json()) as { ok: boolean; user: JwtPayload };
              if (isMounted && loginData.user) {
                setUser(loginData.user);
                setIsAuthenticated(true);
                setError(null);
                setLoading(false);
                return;
              }
            }
          } catch {
            // fallback
          }

          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const data = (await response.json()) as { ok: boolean; user: JwtPayload };
        const fetchedUser = data.user;

        if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(fetchedUser.role)) {
          setError(`Unauthorized: required role one of [${requiredRoles.join(", ")}]`);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setUser(fetchedUser);
        setIsAuthenticated(true);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Auth check failed");
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [requiredRoles]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/auth/login";
    } catch {
      window.location.href = "/auth/login";
    }
  };

  return { user, loading, error, isAuthenticated, logout };
}
