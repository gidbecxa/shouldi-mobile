import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

import { EmptyState } from "../components/EmptyState";
import { QuestionCard } from "../components/QuestionCard";
import { colors } from "../constants/colors";
import { useFeedStore } from "../store/feedStore";
import { useUserStore } from "../store/userStore";
import { useVotedStore } from "../store/votedStore";

export default function FeedScreen() {
  const router = useRouter();
  const deviceId = useUserStore((state) => state.deviceId);
  const { questions, isLoading, error, loadFeed } = useFeedStore();
  const hasVoted = useVotedStore((state) => state.hasVoted);
  const markVoted = useVotedStore((state) => state.markVoted);

  useEffect(() => {
    if (!deviceId) {
      return;
    }

    void loadFeed(deviceId);
  }, [deviceId, loadFeed]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 14 }}>
      {error ? <Text style={{ color: colors.no, marginBottom: 8 }}>{error}</Text> : null}
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            tintColor={colors.accent}
            onRefresh={() => {
              if (deviceId) {
                void loadFeed(deviceId);
              }
            }}
          />
        }
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            hasVoted={hasVoted(item.id)}
            onVote={(questionId) => markVoted(questionId)}
            onOpen={(questionId) => router.push(`/question/${questionId}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No questions yet"
            subtitle="Questions will appear here once people start posting."
          />
        }
      />
    </View>
  );
}
