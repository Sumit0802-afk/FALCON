import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { AuthUser, fetchCurrentUser, logout as doLogout } from "@/services/authService";

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export function useAuth({ requireAuth = false }: { requireAuth?: boolean } = {}): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser()
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          if (!u && requireAuth) {
            router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [requireAuth, router.asPath]);

  const handleLogout = useCallback(async () => {
    await doLogout();
    setUser(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    logout: handleLogout,
  };
}
