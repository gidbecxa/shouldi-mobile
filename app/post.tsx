import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { colors } from "../constants/colors";
import { categories } from "../constants/categories";

export default function PostScreen() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Life");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16, gap: 12 }}>
      <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: "700" }}>Post a Question</Text>

      <TextInput
        placeholder="Should I...?"
        placeholderTextColor={colors.textSecondary}
        value={question}
        onChangeText={setQuestion}
        maxLength={120}
        multiline
        style={{
          minHeight: 110,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          color: colors.textPrimary,
          backgroundColor: colors.card,
          textAlignVertical: "top",
        }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={{
              borderRadius: 999,
              borderWidth: 1,
              borderColor: category === item ? colors.accent : colors.border,
              backgroundColor: category === item ? "rgba(167,139,250,0.15)" : colors.surface,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: colors.textPrimary }}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={{
          marginTop: 8,
          alignItems: "center",
          borderRadius: 12,
          backgroundColor: colors.accent,
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: colors.background, fontWeight: "700" }}>Post (coming next)</Text>
      </Pressable>
    </View>
  );
}
