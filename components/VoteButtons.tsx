import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { colors } from "../constants/colors";
import { typography } from "../constants/typography";

type VoteButtonsProps = {
  onVote: (value: "yes" | "no") => void;
  disabled?: boolean;
  pendingVote?: "yes" | "no" | null;
};

const SNAP = { damping: 22, stiffness: 380 };
const BOUNCE = { damping: 10, stiffness: 200 };

export function VoteButtons({ onVote, disabled = false, pendingVote = null }: VoteButtonsProps) {
  const { t } = useTranslation();
  const yesScale = useSharedValue(1);
  const noScale = useSharedValue(1);

  const yesAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: yesScale.value }] }));
  const noAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: noScale.value }] }));

  const handleYes = async () => {
    if (disabled) return;
    yesScale.value = withSequence(withSpring(0.91, SNAP), withSpring(1, BOUNCE));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVote("yes");
  };

  const handleNo = async () => {
    if (disabled) return;
    noScale.value = withSequence(withSpring(0.91, SNAP), withSpring(1, BOUNCE));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVote("no");
  };

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {/* YES */}
      <Animated.View style={[{ flex: 1 }, yesAnimStyle]}>
        <Pressable
          onPress={() => void handleYes()}
          style={({ pressed }) => ({
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: pendingVote === "yes" ? colors.yes : colors.yesBorder,
            backgroundColor:
              pressed || pendingVote === "yes" ? "rgba(34,197,94,0.20)" : colors.yesSoft,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
          })}
        >
          <Text
            style={{
              color: colors.yes,
              fontFamily: typography.bodyBold,
              fontSize: 16,
              letterSpacing: 0.6,
            }}
          >
            {t('vote.yes')}
          </Text>
        </Pressable>
      </Animated.View>

      {/* NO */}
      <Animated.View style={[{ flex: 1 }, noAnimStyle]}>
        <Pressable
          onPress={() => void handleNo()}
          style={({ pressed }) => ({
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: pendingVote === "no" ? colors.no : colors.noBorder,
            backgroundColor:
              pressed || pendingVote === "no" ? "rgba(239,68,68,0.18)" : colors.noSoft,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            opacity: disabled ? 0.5 : 1,
          })}
        >
          <Text
            style={{
              color: colors.no,
              fontFamily: typography.bodyBold,
              fontSize: 16,
              letterSpacing: 0.6,
            }}
          >
            {t('vote.no')}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

