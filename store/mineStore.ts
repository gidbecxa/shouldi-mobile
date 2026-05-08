import { create } from "zustand";

import { fetchMyQuestions, Question, VoteValue } from "../lib/api";

type MineState = {
  items: Question[];
  isLoading: boolean;
  error: string | null;
  loadMine: (accessToken: string) => Promise<void>;
  prependMineQuestion: (question: Question) => void;
  mergeMineQuestion: (question: Question) => void;
  patchMineQuestion: (questionId: string, patcher: (question: Question) => Question) => void;
  removeMineQuestion: (questionId: string) => void;
  applyOptimisticVote: (questionId: string, vote: VoteValue) => Question | null;
  restoreMineQuestion: (question: Question) => void;
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

export const useMineStore = create<MineState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  loadMine: async (accessToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const payload = await fetchMyQuestions(accessToken);
      set({ items: payload.questions, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load your questions.",
      });
    }
  },
  prependMineQuestion: (question) =>
    set((state) => ({
      items: [question, ...state.items.filter((item) => item.id !== question.id)],
    })),
  mergeMineQuestion: (question) =>
    set((state) => {
      const found = state.items.some((item) => item.id === question.id);
      if (!found) {
        return { items: [question, ...state.items] };
      }

      return {
        items: state.items.map((item) => (item.id === question.id ? { ...item, ...question } : item)),
      };
    }),
  patchMineQuestion: (questionId, patcher) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === questionId ? patcher(item) : item)),
    })),
  removeMineQuestion: (questionId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== questionId),
    })),
  applyOptimisticVote: (questionId, vote) => {
    const target = get().items.find((item) => item.id === questionId);
    if (!target) {
      return null;
    }

    const previous = { ...target };
    set((state) => ({
      items: state.items.map((item) => (item.id === questionId ? applyVote(item, vote) : item)),
    }));

    return previous;
  },
  restoreMineQuestion: (question) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === question.id ? question : item)),
    })),
}));
