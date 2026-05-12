import '../lib/i18n'; // Must be first — initializes i18n before any screen renders
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Linking from "expo-linking";
import {
  GoogleSignin,
  statusCodes as GoogleStatusCodes,
} from "@react-native-google-signin/google-signin";
import {
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { DMMono_500Medium } from "@expo-google-fonts/dm-mono";
import { Syne_700Bold, Syne_800ExtraBold } from "@expo-google-fonts/syne";
import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBackdrop } from "../components/AppBackdrop";
import { PressableScale } from "../components/PressableScale";
import { FeedTabIcon } from "../components/icons/FeedTabIcon";
import { MineTabIcon } from "../components/icons/MineTabIcon";
import { colors } from "../constants/colors";
import { typeScale, typography } from "../constants/typography";
import { fetchMe, signInWithGoogle, updatePushToken, registerTimezone } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";
import { requestPushToken } from "../lib/notifications";
import { useUserStore } from "../store/userStore";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: ["profile", "email"],
});

void SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = "onboarding_seen_v2";
const AUTH_SESSION_KEY = "auth_session_v1";

type PersistedSession = {
  accessToken: string;
  userId: string;
  isBanned: boolean;
  authProvider: "anonymous" | "google";
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

async function readPersistedSession() {
  const raw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedSession;
    if (!parsed.accessToken || !parsed.userId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function savePersistedSession(payload: PersistedSession) {
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(payload));
}

export default function RootLayout() {
  const router = useRouter();
  const { t } = useTranslation();
  const deviceId = useUserStore((state) => state.deviceId);
  const accessToken = useUserStore((state) => state.accessToken);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const setSession = useUserStore((state) => state.setSession);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const setPushToken = useUserStore((state) => state.setPushToken);

  const [fontsLoaded] = useFonts({
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMMono_500Medium,
    Syne_700Bold,
    Syne_800ExtraBold,
  });

  const [isBootstrapReady, setIsBootstrapReady] = useState(false);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExchangingGoogleToken, setIsExchangingGoogleToken] = useState(false);

  const promptGoogleAuth = async () => {
    if (!deviceId) {
      return;
    }

    try {
      setAuthError(null);
      setIsExchangingGoogleToken(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken ?? null;

      if (!idToken) {
        setAuthError("Google sign-in did not return an ID token.");
        return;
      }

      const session = await signInWithGoogle(idToken, deviceId);

      await savePersistedSession({
        accessToken: session.access_token,
        userId: session.user_id,
        isBanned: session.is_banned,
        authProvider: session.auth_provider,
        email: session.profile.email,
        displayName: session.profile.display_name,
        avatarUrl: session.profile.avatar_url,
      });

      setSession({
        deviceId,
        accessToken: session.access_token,
        userId: session.user_id,
        isBanned: session.is_banned,
        authProvider: session.auth_provider,
        email: session.profile.email,
        displayName: session.profile.display_name,
        avatarUrl: session.profile.avatar_url,
      });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (
        code === GoogleStatusCodes.SIGN_IN_CANCELLED ||
        code === GoogleStatusCodes.IN_PROGRESS
      ) {
        // user dismissed or already in progress — no error shown
      } else {
        console.error("Google sign-in failed", error);
        setAuthError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsExchangingGoogleToken(false);
    }
  };

  const onboardingSlides = [
    {
      eyebrow: "Signal",
      title: t('onboarding.slide1Title'),
      description: t('onboarding.slide1Body'),
    },
    {
      eyebrow: "Speed",
      title: t('onboarding.slide2Title'),
      description: t('onboarding.slide2Body'),
    },
    {
      eyebrow: "Momentum",
      title: t('onboarding.slide3Title'),
      description: t('onboarding.slide3Body'),
    },
  ];

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: colors.background,
        card: colors.backgroundRaised,
        border: colors.border,
        primary: colors.brand,
        text: colors.textPrimary,
      },
    }),
    [],
  );

  useEffect(() => {
    function handleDeepLink(url: string) {
      const parsed = Linking.parse(url);
      const normalizedPath = parsed.path?.replace(/^\/+/, "") ?? "";
      const normalizedHost = parsed.hostname?.toLowerCase() ?? "";

      let id: string | undefined;
      if (normalizedPath.startsWith("q/")) {
        id = normalizedPath.slice(2);
      } else if (normalizedHost === "q" && normalizedPath) {
        id = normalizedPath;
      } else if (parsed.queryParams?.id && typeof parsed.queryParams.id === "string") {
        id = parsed.queryParams.id;
      }

      if (id?.trim()) {
        router.push(`/question/${id.trim()}`);
      }
    }

    void Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const nextDeviceId = await getDeviceId();

        if (!isMounted) {
          return;
        }

        setDeviceId(nextDeviceId);

        const restoredSession = await readPersistedSession();
        if (!restoredSession || !isMounted) {
          return;
        }

        setSession({
          deviceId: nextDeviceId,
          accessToken: restoredSession.accessToken,
          userId: restoredSession.userId,
          isBanned: restoredSession.isBanned,
          authProvider: restoredSession.authProvider,
          email: restoredSession.email,
          displayName: restoredSession.displayName,
          avatarUrl: restoredSession.avatarUrl,
        });
      } catch (error) {
        console.error("Failed mobile bootstrap", error);
      } finally {
        if (isMounted) {
          setIsBootstrapReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [setDeviceId, setSession]);

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const profile = await fetchMe(accessToken);
        if (!isMounted) {
          return;
        }

        updateProfile({
          userId: profile.user_id,
          isBanned: profile.is_banned,
          authProvider: profile.auth_provider,
          email: profile.profile.email,
          displayName: profile.profile.display_name,
          avatarUrl: profile.profile.avatar_url,
        });

        await savePersistedSession({
          accessToken,
          userId: profile.user_id,
          isBanned: profile.is_banned,
          authProvider: profile.auth_provider,
          email: profile.profile.email,
          displayName: profile.profile.display_name,
          avatarUrl: profile.profile.avatar_url,
        });
      } catch (error) {
        console.warn("Skipping profile refresh", error);
      }
    };

    void syncProfile();

    return () => {
      isMounted = false;
    };
  }, [accessToken, updateProfile]);

  useEffect(() => {
    let isMounted = true;

    const syncPushToken = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const pushToken = await requestPushToken();
        if (!pushToken || !isMounted) {
          return;
        }

        setPushToken(pushToken);
        await updatePushToken(accessToken, pushToken);
      } catch (error) {
        console.warn("Push notifications unavailable (Firebase not configured):", error);
      }
    };

    void syncPushToken();

    return () => {
      isMounted = false;
    };
  }, [accessToken, setPushToken]);

  useEffect(() => {
    if (!accessToken) return;
    registerTimezone(accessToken).catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    AsyncStorage.getItem("session_count")
      .then((val) => {
        const count = Math.min(parseInt(val ?? "0", 10) + 1, 99);
        return AsyncStorage.setItem("session_count", String(count));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadOnboardingState = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!mounted) {
        return;
      }

      setShowOnboarding(seen !== "true");
      setIsOnboardingReady(true);
    };

    void loadOnboardingState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!fontsLoaded || !isOnboardingReady || !isBootstrapReady) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [fontsLoaded, isOnboardingReady, isBootstrapReady]);

  if (!fontsLoaded || !isOnboardingReady || !isBootstrapReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (showOnboarding) {
    const isLastStep = onboardingStep === onboardingSlides.length - 1;
    const slide = onboardingSlides[onboardingStep];

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppBackdrop />

        <View style={{ flex: 1, paddingHorizontal: 22, paddingVertical: 16, justifyContent: "space-between" }}>
          <View style={{ alignItems: "flex-end" }}>
            <PressableScale
              onPress={async () => {
                await AsyncStorage.setItem(ONBOARDING_KEY, "true");
                setShowOnboarding(false);
              }}
              style={{
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.overlay,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontFamily: typography.bodySemiBold, fontSize: 12 }}>
                {t('onboarding.skip')}
              </Text>
            </PressableScale>
          </View>

          <View
            style={{
              borderRadius: 28,
              borderWidth: 1,
              borderColor: colors.glassStroke,
              backgroundColor: colors.glass,
              paddingHorizontal: 22,
              paddingVertical: 26,
              gap: 18,
            }}
          >
            <Text
              style={{
                color: colors.brand,
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: 12,
                fontFamily: typography.bodyBold,
              }}
            >
              {slide.eyebrow}
            </Text>

            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.display,
                fontSize: 36,
                lineHeight: 42,
                letterSpacing: -0.4,
              }}
            >
              {slide.title}
            </Text>

            <Text style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 17, lineHeight: 25 }}>
              {slide.description}
            </Text>
          </View>
        </View>

        <View style={{ gap: 12, paddingHorizontal: 22, paddingBottom: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {onboardingSlides.map((item, idx) => {
              const isActive = idx === onboardingStep;

              return (
                <View
                  key={item.title}
                  style={{
                    height: 8,
                    flex: isActive ? 2 : 1,
                    borderRadius: 999,
                    backgroundColor: idx <= onboardingStep ? colors.brand : colors.border,
                  }}
                />
              );
            })}
          </View>

          <PressableScale
            onPress={async () => {
              if (!isLastStep) {
                setOnboardingStep((prev) => prev + 1);
                return;
              }

              await AsyncStorage.setItem(ONBOARDING_KEY, "true");
              setShowOnboarding(false);
            }}
            style={{
              alignItems: "center",
              borderRadius: 15,
              backgroundColor: colors.brand,
              paddingVertical: 15,
            }}
          >
            <Text style={{ color: colors.textPrimary, fontFamily: typography.bodyBold, fontSize: 16 }}>
              {isLastStep ? t('onboarding.start') : t('onboarding.next')}
            </Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

  if (!accessToken) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <AppBackdrop />

        <View style={{ flex: 1, paddingHorizontal: 22, paddingVertical: 24, justifyContent: "space-between" }}>
          <View style={{ gap: 14 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: typography.displayHeavy,
                fontSize: 58,
                lineHeight: 60,
                letterSpacing: -1.5,
              }}
            >
              Should I?
            </Text>
            <Text
              style={{
                color: colors.brand,
                fontFamily: typography.bodyBold,
                fontSize: 16,
                letterSpacing: 0.1,
              }}
            >
              Help Me Decide.
            </Text>
            <Text style={{ color: colors.textSecondary, fontFamily: typography.body, fontSize: 15, lineHeight: 23, marginTop: 4 }}>
              Sign in to track your questions while staying anonymous in public.
            </Text>
          </View>

          <View
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.overlay,
              padding: 16,
              gap: 12,
            }}
          >
            <PressableScale
              disabled={isExchangingGoogleToken}
              onPress={() => void promptGoogleAuth()}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                backgroundColor: colors.card,
                paddingVertical: 14,
                alignItems: "center",
                opacity: isExchangingGoogleToken ? 0.65 : 1,
              }}
            >
              <Text style={{ color: colors.textPrimary, fontFamily: typography.bodyBold, fontSize: 16 }}>
                {isExchangingGoogleToken ? "Signing in..." : "Continue with Google"}
              </Text>
            </PressableScale>

            <PressableScale
              disabled
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingVertical: 14,
                alignItems: "center",
                opacity: 0.55,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontFamily: typography.bodySemiBold, fontSize: 15 }}>
                Continue with Apple (coming soon)
              </Text>
            </PressableScale>

            {authError ? (
              <Text style={{ color: colors.no, fontFamily: typography.body, lineHeight: 20 }}>{authError}</Text>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Tabs
        screenOptions={({ route }) => ({
          sceneStyle: { backgroundColor: "transparent" },
          headerShown: false,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            ...typeScale.caption,
            fontFamily: typography.bodySemiBold,
            fontSize: 13,
            marginTop: 2,
          },
          tabBarItemStyle: {
            height: 76,
            // borderWidth: 1,
            // borderColor: colors.border,
            paddingTop: 12,
            paddingBottom: 8,
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          },
          tabBarStyle: {
            position: "absolute",
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: "transparent",
            height: 76,
            left: 14,
            right: 14,
            bottom: 14,
            borderRadius: 24,
            overflow: "hidden",
            justifyContent: "center",
          },
          tabBarBackground: () => (
            <BlurView
              intensity={Platform.OS === "ios" ? 60 : 40}
              tint="dark"
              style={{
                flex: 1,
                backgroundColor: "rgba(14,14,18,0.92)",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.glassStroke,
              }}
            />
          ),
          tabBarIcon: ({ color, focused, size }) => {
            const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
              post: focused ? "add-circle" : "add-circle-outline",
              "question/[id]": "ellipse-outline",
            };

            if (route.name === "index") {
              return <FeedTabIcon color={color} size={22} />;
            }

            if (route.name === "mine") {
              return <MineTabIcon color={color} size={22} />;
            }

            if (route.name === "post") {
              return (
                <View
                  style={{
                    width: 48,
                    height: 48,
                    position: "relative",
                    top: 6,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.brand,
                    shadowColor: colors.brand,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.45,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Ionicons
                    size={20}
                    name={iconByRoute[route.name]}
                    color="#FAFAFA"
                  />
                </View>
              );
            }

            return <Ionicons size={size} name={iconByRoute[route.name]} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: t('tabs.feed'),
          }}
        />

        <Tabs.Screen
          name="post"
          options={{
            tabBarLabel: () => null,
          }}
        />

        <Tabs.Screen
          name="mine"
          options={{
            tabBarLabel: t('tabs.mine'),
          }}
        />

        <Tabs.Screen
          name="question/[id]"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
            tabBarItemStyle: { display: "none" },
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            tabBarStyle: { display: "none" },
            tabBarItemStyle: { display: "none" },
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
