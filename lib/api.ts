import { Category } from "../constants/categories";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000/v1";

export type VoteValue = "yes" | "no";
export type AuthProvider = "anonymous" | "google";

export type Question = {
  id: string;
  text: string;
  category: Category;
  yes_count: number;
  no_count: number;
  yes_percent: number;
  total_votes: number;
  expires_at: string;
  created_at: string;
  user_voted: VoteValue | null;
  is_own: boolean;
};

export type AuthSession = {
  access_token: string;
  user_id: string;
  is_banned: boolean;
  auth_provider: AuthProvider;
  profile: {
    email: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
};

function buildHeaders(accessToken?: string, deviceId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (deviceId) {
    headers["X-Device-ID"] = deviceId;
  }

  return headers;
}

async function readJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error ?? fallbackMessage);
  }

  return payload as T;
}

export async function createSession(deviceId: string) {
  const response = await fetch(`${API_URL}/auth/session`, {
    method: "POST",
    headers: buildHeaders(undefined, deviceId),
    body: JSON.stringify({ device_id: deviceId }),
  });

  return readJsonOrThrow<AuthSession>(response, "Failed to create anonymous session.");
}

export async function signInWithGoogle(idToken: string, deviceId?: string) {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ id_token: idToken, ...(deviceId ? { device_id: deviceId } : {}) }),
  });

  return readJsonOrThrow<AuthSession>(response, "Failed to sign in with Google.");
}

export async function fetchMe(accessToken: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: buildHeaders(accessToken),
  });

  return readJsonOrThrow<Omit<AuthSession, "access_token">>(response, "Failed to fetch your profile.");
}

export async function fetchQuestions(
  accessToken: string,
  params?: { cursor?: string; category?: Category; sort?: "recent" | "hot"; limit?: number },
): Promise<{ questions: Question[]; next_cursor: string | null }> {
  const query = new URLSearchParams();
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.category) query.set("category", params.category);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.limit) query.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/questions${query.toString() ? `?${query.toString()}` : ""}`, {
    headers: buildHeaders(accessToken),
  });

  return readJsonOrThrow<{ questions: Question[]; next_cursor: string | null }>(
    response,
    "Failed to fetch questions.",
  );
}

export async function fetchQuestionById(accessToken: string, questionId: string) {
  const response = await fetch(`${API_URL}/questions/${questionId}`, {
    headers: buildHeaders(accessToken),
  });

  return readJsonOrThrow<Question>(response, "Failed to fetch question details.");
}

export async function createQuestion(
  accessToken: string,
  body: { text: string; category: Category; duration_hours: 1 | 6 | 24 | 72 },
) {
  const response = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify(body),
  });

  return readJsonOrThrow<{ question: Question }>(response, "Failed to post question.");
}

export async function voteOnQuestion(accessToken: string, questionId: string, vote: VoteValue) {
  const response = await fetch(`${API_URL}/questions/${questionId}/vote`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ vote }),
  });

  return readJsonOrThrow<{ yes_count: number; no_count: number; yes_percent: number; user_vote: VoteValue }>(
    response,
    "Failed to submit vote.",
  );
}

export async function reportQuestion(
  accessToken: string,
  questionId: string,
  reason: "harmful" | "inappropriate" | "spam" | "personal_attack",
) {
  const response = await fetch(`${API_URL}/questions/${questionId}/report`, {
    method: "POST",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ reason }),
  });

  return readJsonOrThrow<{ reported: true }>(response, "Failed to report question.");
}

export async function updatePushToken(accessToken: string, pushToken: string) {
  const response = await fetch(`${API_URL}/users/me/push-token`, {
    method: "PATCH",
    headers: buildHeaders(accessToken),
    body: JSON.stringify({ push_token: pushToken }),
  });

  return readJsonOrThrow<{ ok: true }>(response, "Failed to update push token.");
}

export async function fetchMyQuestions(accessToken: string) {
  const response = await fetch(`${API_URL}/users/me/questions`, {
    headers: buildHeaders(accessToken),
  });

  return readJsonOrThrow<{ questions: Question[] }>(response, "Failed to fetch your questions.");
}

export async function deleteMyQuestion(accessToken: string, questionId: string) {
  const response = await fetch(`${API_URL}/users/me/questions/${questionId}/delete`, {
    method: "PATCH",
    headers: buildHeaders(accessToken),
  });

  return readJsonOrThrow<{ id: string; deleted: true }>(response, "Failed to delete question.");
}

export function getShareCardUrl(questionId: string) {
  return `${API_URL}/questions/${questionId}/share-card`;
}
