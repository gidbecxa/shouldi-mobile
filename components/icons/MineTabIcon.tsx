import Svg, { Path, Rect } from "react-native-svg";

type MineTabIconProps = {
  size?: number;
  color: string;
};

export function MineTabIcon({ size = 22, color }: MineTabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={5}
        y={4}
        width={14}
        height={16}
        rx={2.5}
        stroke={color}
        strokeWidth={1.9}
      />
      <Path d="M9 9h6M9 13h6M9 17h4" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
