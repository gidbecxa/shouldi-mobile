import { create } from "zustand";

type VotedState = {
  votedIds: Set<string>;
  markVoted: (questionId: string) => void;
  hasVoted: (questionId: string) => boolean;
};

export const useVotedStore = create<VotedState>((set, get) => ({
  votedIds: new Set<string>(),
  markVoted: (questionId: string) =>
    set((state) => ({
      votedIds: new Set(state.votedIds).add(questionId),
    })),
  hasVoted: (questionId: string) => get().votedIds.has(questionId),
}));
