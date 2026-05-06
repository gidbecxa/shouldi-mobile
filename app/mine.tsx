import { View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { colors } from "../constants/colors";

export default function MineScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center" }}>
      <EmptyState
        title="No posted questions yet"
        subtitle="Questions you post will appear here with live vote progress."
      />
    </View>
  );
}
