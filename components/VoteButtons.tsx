import { Pressable, Text, View } from "react-native";

import { colors } from "../constants/colors";

type VoteButtonsProps = {
  onVote: (value: "yes" | "no") => void;
};

export function VoteButtons({ onVote }: VoteButtonsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderRadius: 12,
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={() => onVote("yes")}
      >
        <Text style={{ color: colors.yes, fontWeight: "700" }}>YES</Text>
      </Pressable>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          borderRadius: 12,
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={() => onVote("no")}
      >
        <Text style={{ color: colors.no, fontWeight: "700" }}>NO</Text>
      </Pressable>
    </View>
  );
}
