import { create } from "zustand";

import { fetchQuestions, Question, VoteValue } from "../lib/api";

type FeedParams = {
  cursor?: string;
  sort?: "recent" | "hot";
};

function applyVote(question: Question, vote: VoteValue) {
  const alreadyVoted = question.user_voted !== null;
  const yesCount = question.yes_count + (alreadyVoted ? 0 : vote === "yes" ? 1 : 0);
  const noCount = question.no_count + (alreadyVoted ? 0 : vote === "no" ? 1 : 0);
  const totalVotes = yesCount + noCount;

  return {
    ...question,
    user_voted: question.user_voted ?? vote,
    yes_count: yesCount,
    no_count: noCount,
    total_votes: totalVotes,
    yes_percent: totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
  };
}

type FeedState = {
  questions: Question[];
  cursor: string | null;
  isLoading: boolean;
  error: string | null;
  loadFeed: (accessToken: string, params?: FeedParams) => Promise<void>;
  insertQuestion: (question: Question) => void;
  mergeQuestion: (question: Question) => void;
  patchQuestion: (questionId: string, patcher: (question: Question) => Question) => void;
  removeQuestion: (questionId: string) => void;
  applyOptimisticVote: (questionId: string, vote: VoteValue) => Question | null;
  restoreQuestion: (question: Question) => void;
};

export const useFeedStore = create<FeedState>((set) => ({
  questions: [],
  cursor: null,
  isLoading: false,
  error: null,
  loadFeed: async (accessToken: string, params?: FeedParams) => {
    set({ isLoading: true, error: null });
    try {
      const payload = await fetchQuestions(accessToken, params);
      set({
        questions: payload.questions,
        cursor: payload.next_cursor,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown feed error",
      });
    }
  },
  insertQuestion: (question) =>
    set((state) => ({
      questions: [question, ...state.questions.filter((item) => item.id !== question.id)],
    })),
  mergeQuestion: (question) =>
    set((state) => ({
      questions: state.questions.some((item) => item.id === question.id)
        ? state.questions.map((item) => (item.id === question.id ? { ...item, ...question } : item))
        : [question, ...state.questions],
    })),
  patchQuestion: (questionId, patcher) =>
    set((state) => ({
      questions: state.questions.map((item) => (item.id === questionId ? patcher(item) : item)),
    })),
  removeQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.filter((item) => item.id !== questionId),
    })),
  applyOptimisticVote: (questionId, vote) => {
    let previous: Question | null = null;

    set((state) => ({
      questions: state.questions.map((item) => {
        if (item.id !== questionId) {
          return item;
        }

        previous = { ...item };
        return applyVote(item, vote);
      }),
    }));

    return previous;
  },
  restoreQuestion: (question) =>
    set((state) => ({
      questions: state.questions.map((item) => (item.id === question.id ? question : item)),
    })),
}));
