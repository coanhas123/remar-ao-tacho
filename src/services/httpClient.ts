const DEFAULT_TIMEOUT = 12000;

type HttpMethod = 'GET' | 'POST';

interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
  method?: HttpMethod;
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

export async function postForm<T>(url: string, body: string, options: HttpRequestOptions = {}): Promise<T> {
  return fetchJson<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      ...(options.headers ?? {}),
    },
    body,
  });
}

export function safeParse<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch(() => null);
}
