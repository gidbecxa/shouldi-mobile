import Svg, { Path } from "react-native-svg";

type FeedTabIconProps = {
  size?: number;
  color: string;
};

export function FeedTabIcon({ size = 22, color }: FeedTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7.5L12 4l7 3.5-7 3.5L5 7.5z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 12l7 3.5 7-3.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 16.5L12 20l7-3.5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
