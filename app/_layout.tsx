import { Tabs } from "expo-router";
import { useEffect } from "react";

import { colors } from "../constants/colors";
import { createSession } from "../lib/api";
import { getDeviceId } from "../lib/deviceId";
import { requestPushToken } from "../lib/notifications";
import { useUserStore } from "../store/userStore";

export default function RootLayout() {
  const setSession = useUserStore((state) => state.setSession);
  const setPushToken = useUserStore((state) => state.setPushToken);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const deviceId = await getDeviceId();
        const session = await createSession(deviceId);

        if (!isMounted) {
          return;
        }

        setSession({
          deviceId,
          userId: session.user_id,
          isBanned: session.is_banned,
        });

        const pushToken = await requestPushToken();
        if (pushToken && isMounted) {
          setPushToken(pushToken);
        }
      } catch (error) {
        console.error("Failed mobile bootstrap", error);
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [setPushToken, setSession]);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed" }} />
      <Tabs.Screen name="post" options={{ title: "Post" }} />
      <Tabs.Screen name="mine" options={{ title: "Mine" }} />
      <Tabs.Screen name="question/[id]" options={{ href: null, title: "Question" }} />
    </Tabs>
  );
}
