const DEFAULT_TIMEOUT = 12000;

interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
}

class HttpError extends Error {
  constructor(message: string, public status: number, public url: string) {
    super(message);
  }
}

export async function fetchJson<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new HttpError(`Request failed with status ${response.status}`, response.status, url);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function safeParse<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch(() => null);
}
