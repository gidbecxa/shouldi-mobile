import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  PanResponder,
} from "react-native";

import { PressableScale } from "./PressableScale";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

const STORAGE_KEY = "firstVoteNudgeShown";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function FirstVoteNudge({ visible, onDismiss }: Props) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    }
  }, [visible, translateY]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: 400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onDismiss());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  const handleAskSomething = () => {
    dismiss();
    // Small delay so sheet animates out before navigation
    setTimeout(() => {
      router.push("/(tabs)/post");
    }, 240);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      {/* Backdrop */}
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}
        onPress={dismiss}
      />
      {/* Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: "#18181B",
          borderTopWidth: 1,
          borderColor: "#27272A",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 40,
          transform: [{ translateY }],
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#3F3F46",
            alignSelf: "center",
            marginBottom: 28,
          }}
        />

        {/* Emoji / icon */}
        <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 16 }}>🌍</Text>

        {/* Headline */}
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.display,
            fontSize: 22,
            lineHeight: 29,
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          You just helped someone decide.
        </Text>

        {/* Body */}
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: typography.body,
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
            marginBottom: 28,
            paddingHorizontal: 8,
          }}
        >
          Got something you're unsure about?{"\n"}The world is listening.
        </Text>

        {/* CTA */}
        <PressableScale
          onPress={handleAskSomething}
          style={{
            backgroundColor: colors.brand,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontFamily: typography.bodyBold, fontSize: 16 }}>
            Ask something →
          </Text>
        </PressableScale>

        {/* Dismiss */}
        <PressableScale onPress={dismiss} style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ color: colors.textMuted, fontFamily: typography.body, fontSize: 14 }}>
            Maybe later
          </Text>
        </PressableScale>
      </Animated.View>
    </Modal>
  );
}

/** Call this after a successful vote. Shows the nudge once, ever. */
export async function maybeShowFirstVoteNudge(
  setVisible: (v: boolean) => void
): Promise<void> {
  try {
    const seen = await AsyncStorage.getItem(STORAGE_KEY);
    if (!seen) {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      setVisible(true);
    }
  } catch {
    // AsyncStorage error — silently skip nudge
  }
}
