const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function apiUrl(path: string): string {
  if (!BASE_PATH) return path;
  return `${BASE_PATH}${path}`;
}

export async function safeParseJsonResponse<T = Record<string, unknown>>(
  res: Response
): Promise<{ ok: boolean; isStaticHost: boolean; data: T | null; error?: string }> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return {
      ok: false,
      isStaticHost: res.status === 404 || ct.includes('text/html'),
      data: null,
      error:
        'Server API routes are unavailable on static hosting (GitHub Pages). Deploy with Vercel or Docker to enable server-side AI & file parsing endpoints.',
    };
  }
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    return {
      ok: false,
      isStaticHost: false,
      data,
      error: data?.error || `Request failed with status ${res.status}`,
    };
  }
  return { ok: true, isStaticHost: false, data };
}
