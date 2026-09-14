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
export function useAuth(requiredRoles?: string[]): UseAuthResult {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // For now, skip auth check since team/auth hasn't implemented endpoints yet
    // When team/auth adds /api/auth/me, uncomment this:
    /*
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const data = (await response.json()) as { user: JwtPayload };
        const fetchedUser = data.user;

        if (requiredRoles && !requiredRoles.includes(fetchedUser.role)) {
          setError(`Unauthorized: required role one of ${requiredRoles.join(", ")}`);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setUser(fetchedUser);
        setIsAuthenticated(true);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth check failed");
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
    */

    // For testing: allow unauthenticated access to demo pages
    setLoading(false);
    setIsAuthenticated(false);
  }, [requiredRoles]);

  return { user, loading, error, isAuthenticated };
}
