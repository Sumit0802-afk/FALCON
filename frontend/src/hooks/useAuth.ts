import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  AuthUser,
  getCurrentUser,
  getToken,
  isAuthenticated,
  logout,
} from "@/services/authService";

interface UseAuthOptions {
  /** If true, redirects to /login when not authenticated. */
  requireAuth?: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

export function useAuth({ requireAuth: require = false }: UseAuthOptions = {}): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();

    if (token && currentUser) {
      setUser(currentUser);
    } else if (require) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }

    setIsLoading(false);
  }, [require, router]);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push("/login");
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout: handleLogout,
  };
}
