export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:4000/api`;
  }
  return "http://localhost:4000/api";
}


const API_BASE_URL = getApiBaseUrl();

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "falcon_token",
    "falcon:accessToken",
    "falcon:token",
    "accessToken",
    "access_token",
    "token",
    "authToken",
  ];

  for (const key of possibleKeys) {
    const value = window.localStorage.getItem(key);

    if (!value || !value.trim()) {
      continue;
    }

    let token = value.trim();

    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1).trim();
    }

    if (!token) {
      continue;
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    if (token) {
      return token;
    }
  }

  return null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${cleanPath}`;

  const token = getAuthToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else {
    headers.delete("Authorization");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";

    let data: T | ApiErrorResponse | null = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text ? ({ message: text } as ApiErrorResponse) : null;
    }

    if (!response.ok) {
      if (
        response.status === 401 &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/register")
      ) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("falcon_token");
          window.localStorage.removeItem("falcon_user");
        }
      }

      const errorData = data as ApiErrorResponse | null;

      throw new Error(
        errorData?.message ||
          errorData?.error ||
          `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return data as T;
  } catch (error) {
    console.error("API request failed:", {
      url,
      error,
    });

    // Handle low-level fetch/network failures (server down or CORS error)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Unable to connect to backend at ${baseUrl}. Please ensure the server is running on port 4000 (cd falcon-backend/backend && npm run dev) and CORS is enabled.`
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to connect to Falcon backend.");
  }
}