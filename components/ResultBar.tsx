import { Text, View } from "react-native";

import { colors } from "../constants/colors";

type ResultBarProps = {
  yesPercent: number;
  noPercent: number;
};

export function ResultBar({ yesPercent, noPercent }: ResultBarProps) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: colors.yes, fontWeight: "600" }}>YES {yesPercent}%</Text>
        <Text style={{ color: colors.no, fontWeight: "600" }}>NO {noPercent}%</Text>
      </View>
      <View style={{ height: 10, borderRadius: 999, backgroundColor: colors.surface, overflow: "hidden", flexDirection: "row" }}>
        <View style={{ width: `${yesPercent}%`, backgroundColor: colors.yes }} />
        <View style={{ width: `${noPercent}%`, backgroundColor: colors.no }} />
      </View>
    </View>
  );
}
