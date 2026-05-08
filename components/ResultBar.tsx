import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

import { colors } from "../constants/colors";

type ResultBarProps = {
  yesPercent: number;
  noPercent: number;
  height?: number;
};

export function ResultBar({ yesPercent, noPercent, height = 8 }: ResultBarProps) {
  const yesAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(yesAnim, {
      toValue: yesPercent,
      duration: 620,
      useNativeDriver: false,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }).start();
  }, [yesAnim, yesPercent, noPercent]);

  const yesBarWidth = yesAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });
  const noBarWidth = yesAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["100%", "0%"],
  });
  const splitLeft = yesAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={{
        height,
        borderRadius: 999,
        backgroundColor: colors.surface,
        overflow: "hidden",
        flexDirection: "row",
      }}
    >
      <Animated.View style={{ width: yesBarWidth, backgroundColor: colors.yes }} />
      <Animated.View style={{ width: noBarWidth, backgroundColor: colors.no }} />
      <Animated.View
        style={{
          position: "absolute",
          left: splitLeft,
          top: 0,
          marginLeft: -0.5,
          width: 1,
          height,
          backgroundColor: "rgba(255,255,255,0.8)",
        }}
      />
      </View>
  );
}

