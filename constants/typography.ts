import { TextStyle } from "react-native";

export const typography = {
  display: "Syne_700Bold",
  displayHeavy: "Syne_800ExtraBold",
  body: "DMSans_500Medium",
  bodySemiBold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
  mono: "DMMono_500Medium",
} as const;

type TextScale = Record<string, TextStyle>;

export const typeScale: TextScale = {
  display_xl: {
    fontFamily: typography.displayHeavy,
    fontSize: 48,
    lineHeight: 52,
  },
  display_lg: {
    fontFamily: typography.displayHeavy,
    fontSize: 36,
    lineHeight: 40,
  },
  display_md: {
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
  },
  display_sm: {
    fontFamily: typography.display,
    fontSize: 22,
    lineHeight: 28,
  },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  micro: {
    fontFamily: typography.mono,
    fontSize: 11,
    lineHeight: 16,
  },
};

