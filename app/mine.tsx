import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackdrop } from "../components/AppBackdrop";
import { EmptyState } from "../components/EmptyState";
import { MineQuestionCard } from "../components/MineQuestionCard";
import { PressableScale } from "../components/PressableScale";
import { SlideUpSheet } from "../components/SlideUpSheet";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { Question, deleteMyQuestion } from "../lib/api";
import { patchQuestionFromRealtime, toRealtimeQuestion } from "../lib/realtimeQuestion";
import { realtimeClient } from "../lib/realtime";
import { useFeedStore } from "../store/feedStore";
import { useMineStore } from "../store/mineStore";
import { useUserStore } from "../store/userStore";

function extractRealtimeId(payloadRow: unknown): string | null {
  if (!payloadRow || typeof payloadRow !== "object") {
    return null;
  }

  const id = (payloadRow as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export default function MineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accessToken = useUserStore((state) => state.accessToken);
  const userId = useUserStore((state) => state.userId);
  const {
    items,
    isLoading,
    error,
    loadMine,
    patchMineQuestion,
    mergeMineQuestion,
    removeMineQuestion,
  } = useMineStore();
  const mergeQuestion = useFeedStore((state) => state.mergeQuestion);
  const patchFeedQuestion = useFeedStore((state) => state.patchQuestion);
  const removeFeedQuestion = useFeedStore((state) => state.removeQuestion);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void loadMine(accessToken);
  }, [accessToken, loadMine]);

  useEffect(() => {
    const client = realtimeClient;
    if (!client || !userId) {
      return;
    }

    const channel = client
      .channel(`mine-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const status = (payload.new as { status?: string }).status;
          const questionId = extractRealtimeId(payload.new);
          if (!questionId) {
            return;
          }

          if (status === "deleted") {
            removeMineQuestion(questionId);
            removeFeedQuestion(questionId);
            return;
          }

          patchMineQuestion(questionId, (existing) => patchQuestionFromRealtime(existing, payload.new));
          patchFeedQuestion(questionId, (existing) => patchQuestionFromRealtime(existing, payload.new));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const question = toRealtimeQuestion(payload.new, userId);
          if (!question) {
            return;
          }

          mergeMineQuestion({ ...question, is_own: true });
          mergeQuestion({ ...question, is_own: true });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "questions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const questionId = extractRealtimeId(payload.old);
          if (!questionId) {
            return;
          }

          removeMineQuestion(questionId);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [
    mergeMineQuestion,
    mergeQuestion,
    patchFeedQuestion,
    patchMineQuestion,
    removeFeedQuestion,
    removeMineQuestion,
    userId,
  ]);

  const totalVotes = items.reduce((acc, current) => acc + current.total_votes, 0);
  const questionLabel = `${items.length.toLocaleString()} ${items.length === 1 ? "Question" : "Questions"}`;
  const votesLabel = `${totalVotes.toLocaleString()} Total Votes`;

  const handleDeleteQuestion = async () => {
    if (!accessToken || !deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteMyQuestion(accessToken, deleteTarget.id);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      removeMineQuestion(deleteTarget.id);
      removeFeedQuestion(deleteTarget.id);

      setDeleteTarget(null);
      setStatusMessage("Question deleted.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to delete question.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View collapsable={false} style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          gap: spacing.md,
          paddingBottom: 132,
        }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.xs, paddingTop: insets.top + spacing.md }}>
            <View style={{ gap: spacing.sm }}>
              <Text
                style={{
                  ...typeScale.display_lg,
                  color: colors.textPrimary,
                }}
              >
                My Board
              </Text>

              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.cardElevated,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <Text style={{ ...typeScale.micro, color: colors.textSecondary }}>{questionLabel}</Text>
                </View>

                <View
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    backgroundColor: colors.cardElevated,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                  }}
                >
                  <Text style={{ ...typeScale.micro, color: totalVotes > 0 ? colors.brand : colors.textSecondary }}>
                    {votesLabel}
                  </Text>
                </View>
              </View>
            </View>

            {error ? (
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.noBorder,
                  backgroundColor: colors.noSoft,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <Text style={{ ...typeScale.caption, color: colors.no, fontFamily: typography.bodySemiBold }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {statusMessage ? (
              <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>{statusMessage}</Text>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            tintColor={colors.brand}
            onRefresh={() => {
              if (accessToken) {
                void loadMine(accessToken);
              }
            }}
          />
        }
        renderItem={({ item }) => (
          <MineQuestionCard
            question={item}
            onOpen={(questionId) => router.push(`/question/${questionId}`)}
            onDelete={() => {
              setDeleteTarget(item);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={{ marginTop: spacing.huge }}>
            <EmptyState
              title="Nothing here yet"
              subtitle="Ask anything. The world is ready to vote."
              icon="help-circle-outline"
            />

            <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
              <PressableScale
                onPress={() => router.push("/post")}
                style={{
                  borderRadius: spacing.base,
                  backgroundColor: colors.brand,
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                }}
              >
                <Text style={{ ...typeScale.caption, color: colors.textPrimary, fontFamily: typography.bodyBold }}>
                  Post your first question →
                </Text>
              </PressableScale>
            </View>
          </View>
        }
      />

      <AppBackdrop />

      <SlideUpSheet
        visible={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        contentStyle={{
          backgroundColor: colors.backgroundRaised,
          borderTopLeftRadius: spacing.xl,
          borderTopRightRadius: spacing.xl,
          borderWidth: 1,
          borderColor: colors.border,
          borderBottomWidth: 0,
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.base,
          paddingBottom: spacing.xxl,
          gap: spacing.base,
        }}
      >
        <View
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            backgroundColor: colors.surface,
            alignSelf: "center",
            marginBottom: spacing.sm,
          }}
        />

        <Text style={{ ...typeScale.title, color: colors.textPrimary }}>Delete this question?</Text>
        <Text style={{ ...typeScale.body, color: colors.textSecondary }}>
          This can't be undone. Your votes will be lost.
        </Text>

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <PressableScale
            onPress={() => setDeleteTarget(null)}
            disabled={isDeleting}
            style={{
              flex: 1,
              borderRadius: spacing.base,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
            }}
          >
            <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>Cancel</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              void handleDeleteQuestion();
            }}
            disabled={isDeleting}
            style={{
              flex: 1,
              borderRadius: spacing.base,
              backgroundColor: colors.no,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 48,
            }}
          >
            <Text style={{ ...typeScale.caption, color: colors.textPrimary, fontFamily: typography.bodyBold }}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Text>
          </PressableScale>
        </View>
      </SlideUpSheet>
    </View>
  );
}
