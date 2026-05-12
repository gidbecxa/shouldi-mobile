import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage } from "../lib/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Animated,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FlashList } from "@shopify/flash-list";
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
import { useVotedStore } from "../store/votedStore";

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
  const { t } = useTranslation();
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
  const [sortMode, setSortMode] = useState<"recent" | "hot">("recent");
  const [pendingVotes, setPendingVotes] = useState<Record<string, VoteValue>>({});
  const [tabWidth, setTabWidth] = useState(0);
  const tabUnderlineX = useRef(new Animated.Value(0)).current;
  const votedMap = useVotedStore((state) => state.votes);
  const setVotedLocal = useVotedStore((state) => state.setVoted);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void loadFeed(accessToken, { sort: sortMode, language: getCurrentLanguage() });
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
      toValue: sortMode === "recent" ? 0 : tabWidth,
      damping: 20,
      stiffness: 300,
      useNativeDriver: false,
    }).start();
  }, [sortMode, tabUnderlineX, tabWidth]);

  const submitVote = async (questionId: string, vote: VoteValue) => {
    if (!accessToken || pendingVotes[questionId]) {
      return;
    }

    const previousFeed = applyOptimisticVote(questionId, vote);
    const previousMine = useMineStore.getState().applyOptimisticVote(questionId, vote);
    if (!previousFeed && !previousMine) {
      return;
    }

    setPendingVotes((current) => ({ ...current, [questionId]: vote }));

    try {
      await voteOnQuestion(accessToken, questionId, vote);
      setVotedLocal(questionId, vote);
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

  // Stable ref so onVote callback never changes reference
  const submitVoteRef = useRef(submitVote);
  submitVoteRef.current = submitVote;

  const stableOnVote = useCallback((questionId: string, vote: VoteValue) => {
    void submitVoteRef.current(questionId, vote);
  }, []);

  const stableOnOpen = useCallback((questionId: string) => {
    router.push(`/question/${questionId}`);
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: Question; index: number }) => {
      const localVote = votedMap[item.id] ?? null;
      const effectiveVote = localVote ?? item.user_voted;
      return (
        <FeedQuestionCard
          question={{ ...item, user_voted: effectiveVote }}
          hasVoted={Boolean(effectiveVote)}
          isVoteSubmitting={Boolean(pendingVotes[item.id])}
          pendingVote={pendingVotes[item.id] ?? null}
          animateDelay={(index % 8) * 50}
          onVote={stableOnVote}
          onOpen={stableOnOpen}
        />
      );
    },
    [pendingVotes, stableOnVote, stableOnOpen, votedMap],
  );

  return (
    <View collapsable={false} style={{ flex: 1 }}>

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <View style={{
        backgroundColor: 'rgba(9,9,11,0.97)',
        paddingTop: insets.top + 8,
        paddingHorizontal: 20,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        {/* Row 1: Logo + Settings */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 44,
          marginBottom: 4,
        }}>
          <Text style={{
            fontFamily: 'Syne_800ExtraBold',
            fontSize: 26,
            color: colors.brand,
            letterSpacing: -0.5,
          }}>
            Should I?
          </Text>
          <PressableScale
            onPress={() => router.push('/settings')}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
          </PressableScale>
        </View>

        {/* Row 2: Tab bar — Recent LEFT (default), Hot RIGHT */}
        <View
          onLayout={(event) => {
            const width = event.nativeEvent.layout.width / 2;
            if (width > 0) setTabWidth(width);
          }}
          style={{
            position: 'relative',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              bottom: -1,
              width: tabWidth,
              height: 2,
              backgroundColor: colors.brand,
              transform: [{ translateX: tabUnderlineX }],
            }}
          />
          {(["recent", "hot"] as const).map((mode) => {
            const active = mode === sortMode;
            return (
              <PressableScale
                key={mode}
                scaleTo={0.98}
                onPress={() => setSortMode(mode)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: spacing.xs,
                }}
              >
                {mode === 'recent' ? (
                  <ClockIcon size={16} color={active ? colors.brand : colors.textMuted} />
                ) : (
                  <FlameIcon size={16} color={active ? colors.brand : colors.textMuted} />
                )}
                <Text style={{
                  color: active ? colors.brand : colors.textMuted,
                  ...(active ? { ...typeScale.caption, fontFamily: typography.bodyBold } : typeScale.caption),
                }}>
                  {mode === 'recent' ? t('feed.recent') : t('feed.hot')}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {/* ── Feed list — scrolls under the sticky header ─────────── */}
      <FlashList
        data={questions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 132,
          paddingTop: spacing.sm,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          error ? (
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.noBorder,
                backgroundColor: colors.noSoft,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ color: colors.no, ...typeScale.caption, fontFamily: typography.bodySemiBold }}>
                {error}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            tintColor={colors.brand}
            onRefresh={() => {
              if (accessToken) {
                void loadFeed(accessToken, { sort: sortMode, language: getCurrentLanguage() });
              }
            }}
          />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title={t('feed.emptyTitle')}
            subtitle={t('feed.emptySub')}
          />
        }
      />

      <AppBackdrop />
    </View>
  );
}
