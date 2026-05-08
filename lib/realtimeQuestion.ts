import { categories, Category } from "../constants/categories";
import { Question } from "./api";

type RowRecord = Record<string, unknown>;

function asRecord(value: unknown): RowRecord | null {
  return typeof value === "object" && value !== null ? (value as RowRecord) : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asCategory(value: unknown): Category | null {
  if (typeof value !== "string") {
    return null;
  }

  return categories.includes(value as Category) ? (value as Category) : null;
}

function toVotePercent(yesCount: number, noCount: number) {
  const totalVotes = yesCount + noCount;
  if (totalVotes <= 0) {
    return { totalVotes: 0, yesPercent: 0 };
  }

  return {
    totalVotes,
    yesPercent: Math.round((yesCount / totalVotes) * 100),
  };
}

export function toRealtimeQuestion(row: unknown, currentUserId?: string | null): Question | null {
  const value = asRecord(row);
  if (!value) {
    return null;
  }

  const id = asString(value.id);
  const text = asString(value.text);
  const category = asCategory(value.category);
  const expiresAt = asString(value.expires_at);
  const createdAt = asString(value.created_at);
  const yesCount = asNumber(value.yes_count);
  const noCount = asNumber(value.no_count);

  if (!id || !text || !category || !expiresAt || !createdAt || yesCount === null || noCount === null) {
    return null;
  }

  const { totalVotes, yesPercent } = toVotePercent(yesCount, noCount);
  const authorId = asString(value.user_id);

  return {
    id,
    text,
    category,
    yes_count: yesCount,
    no_count: noCount,
    yes_percent: yesPercent,
    total_votes: totalVotes,
    expires_at: expiresAt,
    created_at: createdAt,
    user_voted: null,
    is_own: Boolean(currentUserId && authorId && authorId === currentUserId),
  };
}

export function patchQuestionFromRealtime(existing: Question, row: unknown): Question {
  const value = asRecord(row);
  if (!value) {
    return existing;
  }

  const nextYes = asNumber(value.yes_count) ?? existing.yes_count;
  const nextNo = asNumber(value.no_count) ?? existing.no_count;
  const { totalVotes, yesPercent } = toVotePercent(nextYes, nextNo);

  return {
    ...existing,
    text: asString(value.text) ?? existing.text,
    category: asCategory(value.category) ?? existing.category,
    expires_at: asString(value.expires_at) ?? existing.expires_at,
    created_at: asString(value.created_at) ?? existing.created_at,
    yes_count: nextYes,
    no_count: nextNo,
    total_votes: totalVotes,
    yes_percent: yesPercent,
  };
}
