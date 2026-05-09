import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as StoreReview from "expo-store-review";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { AppBackdrop } from "../../components/AppBackdrop";
import { DetailHeader } from "../../components/DetailHeader";
import { FirstVoteNudge, maybeShowFirstVoteNudge } from "../../components/FirstVoteNudge";
import { PressableScale } from "../../components/PressableScale";
import { ResultBar } from "../../components/ResultBar";
import { ShareCard } from "../../components/ShareCard";
import { ShareCardPreview } from "../../components/ShareCardPreview";
import { ShareBottomSheet } from "../../components/ShareBottomSheet";
import { SlideUpSheet } from "../../components/SlideUpSheet";
import { VoteButtons } from "../../components/VoteButtons";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typeScale, typography } from "../../constants/typography";
import { getTimeLeftLabel, getTimeLeftShortLabel } from "../../lib/time";
import {
  fetchQuestionById,
  logShare,
  Question,
  reportQuestion,
  voteOnQuestion,
  VoteValue,
} from "../../lib/api";
import { useUserStore } from "../../store/userStore";

type ReportReason = "harmful" | "inappropriate" | "spam" | "personal_attack";

const REPORT_OPTIONS: Array<{ label: string; value: ReportReason }> = [
  { label: "Harmful", value: "harmful" },
  { label: "Inappropriate", value: "inappropriate" },
  { label: "Spam", value: "spam" },
  { label: "Personal Attack", value: "personal_attack" },
];

export default function QuestionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const accessToken = useUserStore((state) => state.accessToken);
  const [question, setQuestion] = useState<Question | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [menuSheetVisible, setMenuSheetVisible] = useState(false);
  const [reportSheetVisible, setReportSheetVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason>("inappropriate");
  const shareCardRef = useRef<View>(null);
  const shareUrl = question ? `https://shouldi.fun/q/${question.id}?ref=link&via=app` : "";
  const cardUrl = question ? `https://shouldi.fun/q/${question.id}?ref=card&via=app` : "";
  const copyUrl = question ? `https://shouldi.fun/q/${question.id}?ref=copy&via=app` : "";

  useEffect(() => {
    const load = async () => {
      if (!accessToken || !params.id) {
        return;
      }

      try {
        const payload = await fetchQuestionById(accessToken, params.id);
        setQuestion(payload);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Failed to load question.");
      }
    };

    void load();
  }, [accessToken, params.id]);

  const maybePromptRating = async (totalVotes: number) => {
    try {
      const alreadyPrompted = await AsyncStorage.getItem("rating_prompted");
      if (alreadyPrompted === "true") return;
      const sessionCount = parseInt((await AsyncStorage.getItem("session_count")) ?? "0", 10);
      if (sessionCount < 3 || totalVotes < 100) return;
      const isAvailable = await StoreReview.isAvailableAsync();
      if (!isAvailable) return;
      setTimeout(() => {
        void StoreReview.requestReview();
        void AsyncStorage.setItem("rating_prompted", "true");
      }, 3000);
    } catch {
      // Non-fatal
    }
  };

  const handleVote = async (vote: VoteValue) => {
    if (!accessToken || !params.id || !question || question.user_voted) {
      return;
    }

    const previous = { ...question };
    const yesCount = question.yes_count + (vote === "yes" ? 1 : 0);
    const noCount = question.no_count + (vote === "no" ? 1 : 0);
    const totalVotes = yesCount + noCount;

    setQuestion({
      ...question,
      user_voted: vote,
      yes_count: yesCount,
      no_count: noCount,
      total_votes: totalVotes,
      yes_percent: totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
    });

    setIsVoting(true);

    try {
      const payload = await voteOnQuestion(accessToken, params.id, vote);
      setQuestion((current) => {
        if (!current) {
          return current;
        }

        const nextTotalVotes = payload.yes_count + payload.no_count;
        return {
          ...current,
          yes_count: payload.yes_count,
          no_count: payload.no_count,
          yes_percent: payload.yes_percent,
          total_votes: nextTotalVotes,
          user_voted: payload.user_vote,
        };
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void maybeShowFirstVoteNudge(setShowNudge);
      void maybePromptRating(payload.yes_count + payload.no_count);
    } catch (error) {
      setQuestion(previous);
      setStatusMessage(error instanceof Error ? error.message : "Failed to submit vote.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    if (!question || !shareCardRef.current) {
      return;
    }

    setIsSharing(true);

    try {
      const uri = await captureRef(shareCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      const shareMessage = `${question.text}\n\nVote now → ${cardUrl}`;

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: shareMessage,
          UTI: "public.png",
        });
      } else {
        await Share.share({ message: shareMessage, url: Platform.OS === "ios" ? cardUrl : undefined });
      }

      if (accessToken) void logShare(accessToken, question.id, "image");
      await Haptics.selectionAsync();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to share.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareLink = async () => {
    if (!question) {
      return;
    }

    const text = `"${question.text}"\n\n${question.yes_percent}% say YES so far — what do you think?\n\nVote here: ${shareUrl}`;

    await Share.share({
      message: text,
      url: Platform.OS === "ios" ? shareUrl : undefined,
    });

    if (accessToken) void logShare(accessToken, question.id, "link");
  };

  const handleCopyLink = async () => {
    if (!question) {
      return;
    }

    await Clipboard.setStringAsync(copyUrl);
    setStatusMessage("Link copied!");
    setMenuSheetVisible(false);
    setShareSheetVisible(false);
    if (accessToken) void logShare(accessToken, question.id, "copy");
  };

  const handleReport = async (reason: ReportReason) => {
    if (!accessToken || !params.id) {
      return;
    }

    setIsReporting(true);

    try {
      await reportQuestion(accessToken, params.id, reason);
      setStatusMessage("Question reported. Thank you.");
      setReportSheetVisible(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to report question.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsReporting(false);
    }
  };

  const isClosed = question ? getTimeLeftLabel(question.expires_at) === "Closed" : false;
  const showResultState = Boolean(question?.user_voted) || isClosed;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingTop: insets.top + spacing.sm,
          gap: spacing.base,
          flexGrow: 1,
          paddingBottom: spacing.huge,
        }}
      >
        <DetailHeader
          onBack={() => router.back()}
          onOpenMenu={() => {
            setMenuSheetVisible(true);
          }}
        />

        {question ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ ...typeScale.micro, color: colors.brand, letterSpacing: 0.8, textTransform: "uppercase" }}>
                {question.category}
              </Text>
              <Text style={{ ...typeScale.micro, color: colors.textMuted }}>{getTimeLeftShortLabel(question.expires_at)}</Text>
            </View>

            <Text
              style={{
                ...typeScale.display_md,
                color: colors.textPrimary,
                letterSpacing: -0.3,
              }}
            >
              {question.text}
            </Text>

            <Text style={{ ...typeScale.micro, color: colors.brand }}>
              {question.total_votes.toLocaleString()} votes · {question.yes_percent}% say YES so far
            </Text>

            <View style={{ height: spacing.xl }} />

            {showResultState ? (
              <>
                <ResultBar yesPercent={question.yes_percent} noPercent={100 - question.yes_percent} height={14} />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ ...typeScale.caption, color: colors.yes }}>YES {question.yes_percent}%</Text>
                  <Text style={{ ...typeScale.caption, color: colors.no }}>NO {100 - question.yes_percent}%</Text>
                </View>
              </>
            ) : null}

            <View style={{ height: spacing.xl }} />

            {!question.user_voted && !isClosed ? (
              <View style={{ gap: spacing.md }}>
                <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>Cast your vote:</Text>
                <VoteButtons
                  onVote={(vote) => {
                    void handleVote(vote);
                  }}
                  disabled={isVoting}
                />
              </View>
            ) : question.user_voted ? (
              <View
                style={{
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: question.user_voted === "yes" ? colors.yesBorder : colors.noBorder,
                  backgroundColor: question.user_voted === "yes" ? colors.yesSoft : colors.noSoft,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  alignItems: "center",
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    ...typeScale.caption,
                    color: question.user_voted === "yes" ? colors.yes : colors.no,
                    fontFamily: typography.bodyBold,
                  }}
                >
                  You voted {question.user_voted.toUpperCase()} ✓
                </Text>
              </View>
            ) : (
              <Text style={{ ...typeScale.caption, color: colors.textMuted }}>Voting is closed.</Text>
            )}

            <View style={{ height: spacing.xxl }} />

            <View style={{ height: 1, backgroundColor: colors.border }} />

            <View style={{ height: spacing.xl }} />

            <Text style={{ ...typeScale.caption, color: colors.textMuted }}>Share this question</Text>

            <ShareCardPreview
              question={question.text}
              yesPercent={question.yes_percent}
              questionId={question.id}
            />

            <PressableScale
              onPress={() => setShareSheetVisible(true)}
              style={{
                borderRadius: spacing.base,
                backgroundColor: colors.brand,
                minHeight: 54,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.brand,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
                elevation: 6,
              }}
            >
              <Text style={{ ...typeScale.title, color: colors.textPrimary, fontFamily: typography.display }}>
                Invite to Vote
              </Text>
            </PressableScale>

            <PressableScale
              onPress={() => {
                void handleShareLink();
              }}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: spacing.base,
                borderWidth: 1,
                borderColor: colors.brandBorder,
                backgroundColor: "transparent",
                minHeight: 48,
              }}
            >
              <Text style={{ ...typeScale.caption, color: colors.brand, fontFamily: typography.bodyBold }}>
                Share Link
              </Text>
            </PressableScale>

            <View
              ref={shareCardRef}
              collapsable={false}
              style={{
                position: "absolute",
                left: -9999,
                top: 0,
                width: 1080,
              }}
            >
              <ShareCard
                question={question.text}
                yesPercent={question.yes_percent}
                noPercent={100 - question.yes_percent}
                totalVotes={question.total_votes}
                isActive={!isClosed}
                questionId={question.id}
              />
            </View>
          </>
        ) : (
          <Text style={{ ...typeScale.body, color: colors.textSecondary }}>Loading question...</Text>
        )}

        {statusMessage ? (
          <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>
            {statusMessage}
          </Text>
        ) : null}
      </ScrollView>

      <AppBackdrop />

      <ShareBottomSheet
        visible={shareSheetVisible}
        onClose={() => setShareSheetVisible(false)}
        isSharing={isSharing}
        onShareImage={() => {
          setShareSheetVisible(false);
          void handleShare();
        }}
        onShareLink={() => {
          setShareSheetVisible(false);
          void handleShareLink();
        }}
        onCopyLink={() => {
          void handleCopyLink();
        }}
      />

      <SlideUpSheet
        visible={menuSheetVisible}
        onClose={() => setMenuSheetVisible(false)}
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
          gap: spacing.sm,
        }}
      >
        <PressableScale
          onPress={() => {
            setMenuSheetVisible(false);
            setReportSheetVisible(true);
          }}
          style={{
            borderRadius: spacing.base,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.noBorder,
            minHeight: 48,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ ...typeScale.caption, color: colors.no, fontFamily: typography.bodyBold }}>
            Report Question
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => {
            void handleCopyLink();
          }}
          style={{
            borderRadius: spacing.base,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 48,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>Copy Link</Text>
        </PressableScale>

        <PressableScale
          onPress={() => setMenuSheetVisible(false)}
          style={{
            borderRadius: spacing.base,
            minHeight: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ ...typeScale.caption, color: colors.textMuted }}>Cancel</Text>
        </PressableScale>
      </SlideUpSheet>

      <SlideUpSheet
        visible={reportSheetVisible}
        onClose={() => {
          if (!isReporting) {
            setReportSheetVisible(false);
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
          gap: spacing.sm,
        }}
      >
        <Text style={{ ...typeScale.title, color: colors.textPrimary }}>Report question</Text>
        <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>
          Choose a reason to help moderation review quickly.
        </Text>

        {REPORT_OPTIONS.map((option) => {
          const selected = selectedReportReason === option.value;

          return (
            <PressableScale
              key={option.value}
              onPress={() => setSelectedReportReason(option.value)}
              style={{
                borderRadius: spacing.base,
                borderWidth: 1,
                borderColor: selected ? colors.brandBorder : colors.border,
                backgroundColor: selected ? colors.brandSoft : colors.card,
                minHeight: 48,
                justifyContent: "center",
                paddingHorizontal: spacing.base,
              }}
            >
              <Text style={{ ...typeScale.caption, color: selected ? colors.brand : colors.textSecondary }}>
                {option.label}
              </Text>
            </PressableScale>
          );
        })}

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
          <PressableScale
            onPress={() => setReportSheetVisible(false)}
            disabled={isReporting}
            style={{
              flex: 1,
              borderRadius: spacing.base,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              minHeight: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>Cancel</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              void handleReport(selectedReportReason);
            }}
            disabled={isReporting}
            style={{
              flex: 1,
              borderRadius: spacing.base,
              backgroundColor: colors.no,
              minHeight: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ ...typeScale.caption, color: colors.textPrimary, fontFamily: typography.bodyBold }}>
              {isReporting ? "Reporting..." : "Confirm"}
            </Text>
          </PressableScale>
        </View>
      </SlideUpSheet>

      <FirstVoteNudge visible={showNudge} onDismiss={() => setShowNudge(false)} />
    </View>
  );
}
