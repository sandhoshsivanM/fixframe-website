// Thin API client. Server components call the API directly; the browser
// goes through the same base URL so cookies flow for admin routes.
// The localhost default is a development convenience only. A production
// build must never point a visitor's browser at their own machine, so there
// it is whatever NEXT_PUBLIC_API says — and an empty base if it says nothing,
// which makes every call fail fast and visibly rather than hitting :5180.
export const API =
  process.env.NEXT_PUBLIC_API ??
  (process.env.NODE_ENV === "development" ? "http://localhost:5180/api/v1" : "");

export async function get<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { cache: "no-store", credentials: "include", ...init });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function post<T>(path: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => null)) as T | null };
}

export async function patch<T>(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: (await res.json().catch(() => null)) as T | null };
}
