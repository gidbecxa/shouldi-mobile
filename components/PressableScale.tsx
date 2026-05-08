import { ReactNode } from "react";
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type PressableScaleProps = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  activeOpacity?: number;
  scaleTo?: number;
};

export function PressableScale({
  children,
  style,
  activeOpacity = 0.75,
  scaleTo = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={(event) => {
        scale.value = withTiming(disabled ? 1 : scaleTo, { duration: 80 });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 80 });
        onPressOut?.(event);
      }}
      style={(state) => {
        const nextStyle = typeof style === "function" ? style(state) : style;

        return [
          nextStyle,
          {
            opacity: disabled ? 0.6 : state.pressed ? activeOpacity : 1,
          },
        ];
      }}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
