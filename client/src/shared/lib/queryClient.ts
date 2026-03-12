// shared/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader } from "@/shared/lib/keycloak";

const DEFAULT_TIMEOUT_MS =
  Number(process.env.REACT_APP_FETCH_TIMEOUT_MS) || 300000; // 5 minutos

function buildHeaders(data?: unknown): Record<string, string> {
  const headers: Record<string, string> = {};

  // No poner Content-Type si es FormData
  if (data && !(data instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  Object.assign(headers, getAuthHeader());
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

type ApiRequestOptions = {
  timeoutMs?: number;
  throwOnError?: boolean;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, throwOnError = true } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData = data instanceof FormData;

    const res = await fetch(url, {
      method,
      headers: buildHeaders(data),
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    if (throwOnError) {
      await throwIfResNotOk(res);
    }

    return res;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`REQUEST_TIMEOUT_${timeoutMs}`);
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const url = queryKey[0] as string;

      const res = await apiRequest("GET", url, undefined, {
        throwOnError: false,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);

      return res.json();
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