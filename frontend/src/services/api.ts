export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:4000/api`;
  }
  return "http://localhost:4000/api";
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${cleanPath}`;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  // Send Bearer token if stored (hybrid support alongside HttpOnly cookies)
  if (typeof window !== "undefined") {
    const storedToken = localStorage.getItem("falcon_token");
    if (storedToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${storedToken}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",  // Always send cookies for session-based auth
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
        !url.includes("/auth/register") &&
        !url.includes("/auth/verify-otp") &&
        !url.includes("/auth/me")
      ) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("falcon_token");
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
    // Only log at debug level — never log auth tokens or request bodies
    if (process.env.NODE_ENV === "development") {
      console.warn("[api] Request failed:", url, error instanceof Error ? error.message : error);
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Unable to connect to Falcon backend at ${baseUrl}. Please ensure the server is running (cd falcon-backend/backend && npm run dev).`
      );
    }

    if (error instanceof Error) throw error;
    throw new Error("Unable to connect to Falcon backend.");
  }
}