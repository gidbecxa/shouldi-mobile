import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackdrop } from "../components/AppBackdrop";
import { EmptyState } from "../components/EmptyState";
import { FeedQuestionCard } from "../components/FeedQuestionCard";
import { PressableScale } from "../components/PressableScale";
import { ClockIcon } from "../components/icons/ClockIcon";
import { FlameIcon } from "../components/icons/FlameIcon";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { Question, VoteValue, voteOnQuestion } from "../lib/api";
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

export default function FeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accessToken = useUserStore((state) => state.accessToken);
  const userId = useUserStore((state) => state.userId);
  const {
    questions,
    isLoading,
    error,
    loadFeed,
    patchQuestion,
    insertQuestion,
    removeQuestion,
    applyOptimisticVote,
    restoreQuestion,
  } = useFeedStore();
  const patchMineQuestion = useMineStore((state) => state.patchMineQuestion);
  const [sortMode, setSortMode] = useState<"recent" | "hot">("hot");
  const [pendingVotes, setPendingVotes] = useState<Record<string, VoteValue>>({});
  const [tabWidth, setTabWidth] = useState(0);
  const [visibleIds, setVisibleIds] = useState<Record<string, true>>({});
  const tabUnderlineX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void loadFeed(accessToken, { sort: sortMode });
  }, [accessToken, loadFeed, sortMode]);

  useEffect(() => {
    const client = realtimeClient;
    if (!client || !accessToken) {
      return;
    }

    const channel = client
      .channel(`feed-realtime-${sortMode}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "questions" }, (payload) => {
        const status = (payload.new as { status?: string }).status;
        const questionId = extractRealtimeId(payload.new);
        if (!questionId) {
          return;
        }

        if (status && status !== "active") {
          removeQuestion(questionId);
          useMineStore.getState().removeMineQuestion(questionId);
          return;
        }

        patchQuestion(questionId, (existing) => patchQuestionFromRealtime(existing, payload.new));
        patchMineQuestion(questionId, (existing) => patchQuestionFromRealtime(existing, payload.new));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "questions" }, (payload) => {
        const question = toRealtimeQuestion(payload.new, userId);
        if (!question) {
          return;
        }

        insertQuestion(question);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "questions" }, (payload) => {
        const questionId = extractRealtimeId(payload.old);
        if (!questionId) {
          return;
        }

        removeQuestion(questionId);
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [accessToken, insertQuestion, patchMineQuestion, patchQuestion, removeQuestion, sortMode, userId]);

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    Animated.spring(tabUnderlineX, {
      toValue: sortMode === "hot" ? 0 : tabWidth,
      damping: 20,
      stiffness: 300,
      useNativeDriver: false,
    }).start();
  }, [sortMode, tabUnderlineX, tabWidth]);

  const submitVote = async (questionId: string, vote: VoteValue) => {
    if (!accessToken || pendingVotes[questionId]) {
      return;
    }

    LayoutAnimation.configureNext(
      LayoutAnimation.create(320, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity),
    );

    const previousFeed = applyOptimisticVote(questionId, vote);
    const previousMine = useMineStore.getState().applyOptimisticVote(questionId, vote);
    if (!previousFeed && !previousMine) {
      return;
    }

    setPendingVotes((current) => ({ ...current, [questionId]: vote }));

    try {
      await voteOnQuestion(accessToken, questionId, vote);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (submitError) {
      if (previousFeed) {
        restoreQuestion(previousFeed);
      }

      if (previousMine) {
        useMineStore.getState().restoreMineQuestion(previousMine);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Vote failed", submitError);
    } finally {
      setPendingVotes((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
    }
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken & { item: Question }> }) => {
      setVisibleIds((current) => {
        let changed = false;
        const next = { ...current };

        for (const viewable of viewableItems) {
          const itemId = viewable.item?.id;
          if (viewable.isViewable && itemId && !next[itemId]) {
            next[itemId] = true;
            changed = true;
          }
        }

        return changed ? next : current;
      });
    },
  );

  return (
    <View collapsable={false} style={{ flex: 1 }}>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          gap: spacing.md,
          paddingBottom: 132,
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 35 }}
        ListHeaderComponent={
          <View style={{ gap: 0, marginBottom: spacing.sm, paddingTop: insets.top + spacing.md }}>
            <View
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width / 2;
                if (width > 0) {
                  setTabWidth(width);
                }
              }}
              style={{
                position: "relative",
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -1,
                  width: tabWidth,
                  height: 2,
                  backgroundColor: colors.brand,
                  transform: [{ translateX: tabUnderlineX }],
                }}
              />

              {(["hot", "recent"] as const).map((mode) => {
                const active = mode === sortMode;
                return (
                  <PressableScale
                    key={mode}
                    scaleTo={0.98}
                    onPress={() => setSortMode(mode)}
                    style={{
                      flex: 1,
                      paddingVertical: spacing.md,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: spacing.xs,
                    }}
                  >
                    {mode === "hot" ? (
                      <FlameIcon size={16} color={active ? colors.brand : colors.textMuted} />
                    ) : (
                      <ClockIcon size={16} color={active ? colors.brand : colors.textMuted} />
                    )}
                    <Text
                      style={{
                        color: active ? colors.brand : colors.textMuted,
                        ...(active ? { ...typeScale.caption, fontFamily: typography.bodyBold } : typeScale.caption),
                      }}
                    >
                      {mode === "hot" ? "Hot" : "Recent"}
                    </Text>
                  </PressableScale>
                );
              })}
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
                  marginTop: spacing.sm,
                }}
              >
                <Text style={{ color: colors.no, ...typeScale.caption, fontFamily: typography.bodySemiBold }}>
                  {error}
                </Text>
              </View>
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            tintColor={colors.brand}
            onRefresh={() => {
              if (accessToken) {
                void loadFeed(accessToken, { sort: sortMode });
              }
            }}
          />
        }
        renderItem={({ item, index }) => (
          <FeedQuestionCard
            question={item}
            hasVoted={Boolean(item.user_voted)}
            isVoteSubmitting={Boolean(pendingVotes[item.id])}
            pendingVote={pendingVotes[item.id] ?? null}
            animateIn={Boolean(visibleIds[item.id])}
            animateDelay={(index % 8) * 50}
            onVote={(questionId, vote) => {
              void submitVote(questionId, vote);
            }}
            onOpen={(questionId) => router.push(`/question/${questionId}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No active questions right now"
            subtitle="Post something bold and the crowd will start shaping your answer."
          />
        }
      />

      <AppBackdrop />
    </View>
  );
}
