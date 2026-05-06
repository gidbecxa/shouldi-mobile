import { create } from "zustand";

import { fetchQuestions, Question } from "../lib/api";

type FeedState = {
  questions: Question[];
  cursor: string | null;
  isLoading: boolean;
  error: string | null;
  loadFeed: (deviceId: string) => Promise<void>;
};

export const useFeedStore = create<FeedState>((set) => ({
  questions: [],
  cursor: null,
  isLoading: false,
  error: null,
  loadFeed: async (deviceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const payload = await fetchQuestions(deviceId);
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
}));
