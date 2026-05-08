import Svg, { Circle, Path } from "react-native-svg";

type ClockIconProps = {
  size?: number;
  color: string;
};

export function ClockIcon({ size = 16, color }: ClockIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.4} stroke={color} strokeWidth={1.9} />
      <Path d="M12 7.8v5.1l3.2 1.8" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
