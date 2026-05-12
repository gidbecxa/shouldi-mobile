import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

interface ShareCardFullProps {
  question: {
    text: string;
    category: string;
    yes_count: number;
    no_count: number;
    total_votes: number;
    yes_percent: number;
    language?: string;
  };
  questionId: string;
}

export const ShareCardFull = forwardRef<View, ShareCardFullProps>(
  ({ question, questionId }, ref) => {
    const { width: screenWidth } = useWindowDimensions();
    const cardWidth = screenWidth;
    const cardHeight = screenWidth * (16 / 9);

    const yesPercent = Math.round(question.yes_percent);
    const noPercent = 100 - yesPercent;

    const isFr = question.language === 'fr';
    const yesLabel = isFr ? 'OUI' : 'YES';
    const noLabel = isFr ? 'NON' : 'NO';
    const voteNowLabel = isFr ? 'Voter →' : 'Vote now →';
    const votesLabel = isFr
      ? `${question.total_votes.toLocaleString()} votes`
      : `${question.total_votes.toLocaleString()} votes`;

    const categoryColors: Record<string, { bg: string; text: string }> = {
      Life:   { bg: 'rgba(167,139,250,0.20)', text: '#A78BFA' },
      Love:   { bg: 'rgba(244,114,182,0.20)', text: '#F472B6' },
      Career: { bg: 'rgba(251,146,60,0.20)',  text: '#FB923C' },
      Money:  { bg: 'rgba(74,222,128,0.20)',  text: '#4ADE80' },
      Health: { bg: 'rgba(56,189,248,0.20)',  text: '#38BDF8' },
      Fun:    { bg: 'rgba(252,211,77,0.20)',  text: '#FCD34D' },
      Other:  { bg: 'rgba(148,163,184,0.20)', text: '#94A3B8' },
    };
    const catColors = categoryColors[question.category] ?? categoryColors.Other;

    return (
      <View
        ref={ref}
        style={[styles.card, { width: cardWidth, height: cardHeight }]}
        collapsable={false}
      >
        {/* Background accent circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Top: Wordmark */}
        <View style={styles.topRow}>
          <View style={styles.wordmarkPill}>
            <Text style={styles.wordmarkText}>Should I?</Text>
          </View>
        </View>

        {/* Middle: Category + Question */}
        <View style={styles.contentArea}>
          <View style={[styles.categoryBadge, { backgroundColor: catColors.bg }]}>
            <Text style={[styles.categoryText, { color: catColors.text }]}>
              {question.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.questionText} numberOfLines={8}>
            {question.text}
          </Text>
        </View>

        {/* Bottom: Result bar + stats + CTA */}
        <View style={styles.bottomArea}>
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <Text style={styles.yesPercent}>{yesPercent}%</Text>
            <Text style={styles.statsMiddle}>{votesLabel}</Text>
            <Text style={styles.noPercent}>{noPercent}%</Text>
          </View>
          <View style={styles.statsLabelRow}>
            <Text style={styles.yesLabel}>{yesLabel}</Text>
            <Text style={styles.noLabel}>{noLabel}</Text>
          </View>

          <View style={styles.resultBarTrack}>
            <View style={[styles.resultBarYes, { flex: yesPercent || 1 }]} />
            <View style={styles.resultBarDivider} />
            <View style={[styles.resultBarNo, { flex: noPercent || 1 }]} />
          </View>

          <View style={styles.ctaRow}>
            <Text style={styles.ctaUrl}>shouldi.fun/q/{questionId.slice(0, 8)}</Text>
            <View style={styles.ctaPill}>
              <Text style={styles.ctaText}>{voteNowLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
);

ShareCardFull.displayName = 'ShareCardFull';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#09090B',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 0,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(167,139,250,0.06)',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(167,139,250,0.04)',
    bottom: 100,
    left: -80,
  },
  topRow: {
    paddingHorizontal: 36,
    paddingTop: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmarkPill: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.30)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  wordmarkText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: '#A78BFA',
    letterSpacing: -0.3,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 36,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  categoryText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 1.2,
  },
  questionText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 38,
    color: '#FAFAFA',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  bottomArea: {
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  yesPercent: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 52,
    color: '#22C55E',
    lineHeight: 56,
  },
  statsMiddle: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 15,
    color: '#52525B',
  },
  noPercent: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 52,
    color: '#EF4444',
    lineHeight: 56,
  },
  statsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  yesLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#22C55E',
    letterSpacing: 1.5,
  },
  noLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#EF4444',
    letterSpacing: 1.5,
  },
  resultBarTrack: {
    height: 20,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#27272B',
    marginBottom: 28,
  },
  resultBarYes: {
    backgroundColor: '#22C55E',
    minWidth: 4,
  },
  resultBarDivider: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  resultBarNo: {
    backgroundColor: '#EF4444',
    minWidth: 4,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaUrl: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 14,
    color: '#52525B',
    flex: 1,
    marginRight: 12,
  },
  ctaPill: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.35)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ctaText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#A78BFA',
  },
});
