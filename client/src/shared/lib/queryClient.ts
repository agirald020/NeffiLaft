import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader } from "@/shared/lib/keycloak";

function buildHeaders(data?: unknown): Record<string, string> {
  const headers: Record<string, string> = {};
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  // Always include Bearer token if Keycloak has one (no-op in bypass mode)
  Object.assign(headers, getAuthHeader());
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  timeoutMs = 300_000, // 5 minutes by default
): Promise<Response> {
  // AbortController para poder cancelar la petición si pasa el timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData = data instanceof FormData;
    const res = await fetch(url, {
      method,
      headers: buildHeaders(data),
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Si fue abortada por el timeout, normalizamos el error para facilitar manejo
    if (err && err.name === "AbortError") {
      throw new Error(`Timeout: la petición a ${url} superó ${Math.round(timeoutMs / 1000)}s`);
    }

    // Re-lanzamos el error original (fetch/network/otros)
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      headers: buildHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
