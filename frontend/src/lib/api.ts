const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export type College = {
  id: number;
  college_name: string;
  state: string;
  stream: string;
  ug_fee: number | null;
  pg_fee: number | null;
  rating: number;
  academic: number;
  accommodation: number;
  faculty: number;
  infrastructure: number;
  placement: number;
  social_life: number;
  profile: string;
};

export type ChatResponse = {
  route: string;
  answer: string;
  results: College[];
  memory: Record<string, unknown>;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  chat: (message: string) =>
    request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id: "demo-user" })
    }),
  recommend: (params: URLSearchParams) => request<{ count: number; results: College[] }>(`/recommend?${params}`),
  compare: (names: string) => request<{ colleges: College[]; metrics: Record<string, unknown[]>; clarifications: string[] }>(`/compare?names=${encodeURIComponent(names)}`),
  career: (interests: string) =>
    request<{ recommended_streams: string[]; guidance: string }>("/career", {
      method: "POST",
      body: JSON.stringify({ interests })
    })
};
