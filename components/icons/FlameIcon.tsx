import Svg, { Path } from "react-native-svg";

type FlameIconProps = {
  size?: number;
  color: string;
};

export function FlameIcon({ size = 16, color }: FlameIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.6 3.8c.8 2.4-.4 4.5-2.4 5.8-1.2.8-2 1.9-2 3.4 0 2 1.6 3.6 3.7 3.6 2.8 0 4.7-2.4 4.7-5.2 0-3-1.7-5.4-4-7.6z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinejoin="round"
      />
      <Path
        d="M8.8 12.8c-1.8 1.4-2.8 3.2-2.8 5 0 2.2 1.9 4 4.2 4 1.6 0 3-.8 3.8-2.1"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </Svg>
  );
}
