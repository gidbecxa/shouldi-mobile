import { create } from "zustand";

type UserState = {
  deviceId: string | null;
  userId: string | null;
  pushToken: string | null;
  isBanned: boolean;
  setSession: (payload: { deviceId: string; userId: string; isBanned: boolean }) => void;
  setPushToken: (pushToken: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  deviceId: null,
  userId: null,
  pushToken: null,
  isBanned: false,
  setSession: ({ deviceId, userId, isBanned }) =>
    set({
      deviceId,
      userId,
      isBanned,
    }),
  setPushToken: (pushToken) => set({ pushToken }),
}));
