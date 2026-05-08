import { create } from "zustand";

import { AuthProvider } from "../lib/api";

type UserState = {
  deviceId: string | null;
  accessToken: string | null;
  userId: string | null;
  pushToken: string | null;
  isBanned: boolean;
  authProvider: AuthProvider | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  setDeviceId: (deviceId: string) => void;
  setSession: (payload: {
    deviceId: string;
    accessToken: string;
    userId: string;
    isBanned: boolean;
    authProvider: AuthProvider;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  }) => void;
  updateProfile: (payload: {
    userId: string;
    isBanned: boolean;
    authProvider: AuthProvider;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  }) => void;
  setPushToken: (pushToken: string) => void;
  clearSession: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  deviceId: null,
  accessToken: null,
  userId: null,
  pushToken: null,
  isBanned: false,
  authProvider: null,
  email: null,
  displayName: null,
  avatarUrl: null,
  setDeviceId: (deviceId) => set({ deviceId }),
  setSession: ({
    deviceId,
    accessToken,
    userId,
    isBanned,
    authProvider,
    email,
    displayName,
    avatarUrl,
  }) =>
    set({
      deviceId,
      accessToken,
      userId,
      isBanned,
      authProvider,
      email,
      displayName,
      avatarUrl,
    }),
  updateProfile: ({ userId, isBanned, authProvider, email, displayName, avatarUrl }) =>
    set((state) => ({
      ...state,
      userId,
      isBanned,
      authProvider,
      email,
      displayName,
      avatarUrl,
    })),
  setPushToken: (pushToken) => set({ pushToken }),
  clearSession: () =>
    set((state) => ({
      ...state,
      accessToken: null,
      userId: null,
      pushToken: null,
      isBanned: false,
      authProvider: null,
      email: null,
      displayName: null,
      avatarUrl: null,
    })),
}));
