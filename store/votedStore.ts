import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface VotedStore {
  votes: Record<string, "yes" | "no">;
  setVoted: (questionId: string, vote: "yes" | "no") => void;
  getVote: (questionId: string) => "yes" | "no" | null;
  hasVoted: (questionId: string) => boolean;
}

export const useVotedStore = create<VotedStore>()(
  persist(
    (set, get) => ({
      votes: {},
      setVoted: (questionId, vote) =>
        set((state) => ({ votes: { ...state.votes, [questionId]: vote } })),
      getVote: (questionId) => get().votes[questionId] ?? null,
      hasVoted: (questionId) => questionId in get().votes,
    }),
    {
      name: "voted-questions",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
