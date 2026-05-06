import { Category } from "../constants/categories";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/v1";

export type VoteValue = "yes" | "no";

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

function buildHeaders(deviceId: string) {
  return {
    "Content-Type": "application/json",
    "X-Device-ID": deviceId,
  };
}

export async function createSession(deviceId: string) {
  const response = await fetch(`${API_URL}/auth/session`, {
    method: "POST",
    headers: buildHeaders(deviceId),
    body: JSON.stringify({ device_id: deviceId }),
  });

  if (!response.ok) {
    throw new Error("Failed to create anonymous session.");
  }

  return (await response.json()) as { user_id: string; is_banned: boolean };
}

export async function fetchQuestions(deviceId: string): Promise<{ questions: Question[]; next_cursor: string | null }> {
  const response = await fetch(`${API_URL}/questions`, {
    headers: buildHeaders(deviceId),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch questions.");
  }

  return (await response.json()) as { questions: Question[]; next_cursor: string | null };
}
