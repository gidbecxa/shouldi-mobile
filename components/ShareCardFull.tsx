import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

function getQuestionTextStyle(length: number) {
  if (length <= 50)  return { fontSize: 44, lineHeight: 52, numberOfLines: 4 };
  if (length <= 80)  return { fontSize: 36, lineHeight: 44, numberOfLines: 5 };
  if (length <= 105) return { fontSize: 30, lineHeight: 38, numberOfLines: 6 };
  return { fontSize: 26, lineHeight: 33, numberOfLines: 7 };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Life:    { bg: 'rgba(167,139,250,0.18)', text: '#A78BFA' },
  Love:    { bg: 'rgba(244,114,182,0.18)', text: '#F472B6' },
  Career:  { bg: 'rgba(251,146,60,0.18)',  text: '#FB923C' },
  Money:   { bg: 'rgba(74,222,128,0.18)',  text: '#4ADE80' },
  Health:  { bg: 'rgba(56,189,248,0.18)',  text: '#38BDF8' },
  Fun:     { bg: 'rgba(252,211,77,0.18)',  text: '#FCD34D' },
  Other:   { bg: 'rgba(148,163,184,0.18)', text: '#94A3B8' },
};

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
    const cardWidth  = screenWidth;
    const cardHeight = Math.round(screenWidth * (16 / 9));

    const yesPercent = Math.max(1, Math.round(question.yes_percent));
    const noPercent  = Math.max(1, 100 - yesPercent);
    const cat        = CATEGORY_COLORS[question.category] ?? CATEGORY_COLORS.Other;
    const textStyle  = getQuestionTextStyle(question.text.length);
    const isFr       = question.language === 'fr';
    const yesLabel   = isFr ? 'OUI' : 'YES';
    const noLabel    = isFr ? 'NON' : 'NO';
    const voteLabel  = isFr ? 'Voter →' : 'Vote now →';
    const shortId    = questionId.slice(0, 8);

    return (
      <View
        ref={ref}
        collapsable={false}
        style={{ width: cardWidth, height: cardHeight, backgroundColor: '#09090B', overflow: 'hidden' }}
      >

        {/* ── Decorative background glows ── */}
        <View style={[styles.glowCircle, {
          width: cardWidth * 0.9,
          height: cardWidth * 0.9,
          borderRadius: cardWidth * 0.45,
          top: -cardWidth * 0.25,
          right: -cardWidth * 0.25,
        }]} />
        <View style={[styles.glowCircleSmall, {
          width: cardWidth * 0.55,
          height: cardWidth * 0.55,
          borderRadius: cardWidth * 0.275,
          bottom: cardHeight * 0.15,
          left: -cardWidth * 0.18,
        }]} />

        {/* ── Top zone (flexible — grows with content) ── */}
        <View style={[styles.topZone, { paddingTop: 56, paddingHorizontal: 32 }]}>

          {/* Wordmark pill */}
          <View style={styles.wordmarkPill}>
            <Text style={styles.wordmarkText}>Should I?</Text>
          </View>

          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: cat.bg, marginTop: 14 }]}>
            <Text style={[styles.categoryText, { color: cat.text }]}>
              {question.category.toUpperCase()}
            </Text>
          </View>

          {/* Question text — adaptive font size, never clips */}
          <Text
            style={[styles.questionText, { fontSize: textStyle.fontSize, lineHeight: textStyle.lineHeight }]}
            numberOfLines={textStyle.numberOfLines}
            ellipsizeMode="tail"
          >
            {question.text}
          </Text>

        </View>

        {/* ── Bottom zone (fixed — anchored to bottom) ── */}
        <View style={[styles.bottomZone, { paddingHorizontal: 32, paddingBottom: 52 }]}>

          {/* Visual separator */}
          <View style={styles.separator} />

          {/* Result bar */}
          <View style={styles.resultBarTrack}>
            <View style={[styles.resultBarYes, { flex: yesPercent }]} />
            <View style={styles.resultBarDivider} />
            <View style={[styles.resultBarNo,  { flex: noPercent  }]} />
          </View>

          {/* Stats line — single compact row, no overflow */}
          <View style={styles.statsLine}>
            <Text style={styles.yesStatText}>{yesLabel} {yesPercent}%</Text>
            <Text style={styles.voteCountText}>{question.total_votes.toLocaleString()} votes</Text>
            <Text style={styles.noStatText}>{noPercent}% {noLabel}</Text>
          </View>

          {/* CTA row — URL shrinks to give pill space */}
          <View style={styles.ctaRow}>
            <Text style={styles.ctaUrl} numberOfLines={1} ellipsizeMode="tail">
              shouldi.fun/q/{shortId}
            </Text>
            <View style={styles.ctaPill}>
              <Text style={styles.ctaPillText}>{voteLabel}</Text>
            </View>
          </View>

        </View>

      </View>
    );
  }
);

ShareCardFull.displayName = 'ShareCardFull';

const styles = StyleSheet.create({
  // Decorative glows
  glowCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(167,139,250,0.055)',
  },
  glowCircleSmall: {
    position: 'absolute',
    backgroundColor: 'rgba(167,139,250,0.038)',
  },

  // Top zone
  topZone: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  wordmarkPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(167,139,250,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.32)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  wordmarkText: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 20,
    color: '#A78BFA',
    letterSpacing: -0.2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 22,
  },
  categoryText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 1.3,
  },
  questionText: {
    fontFamily: 'Syne_800ExtraBold',
    color: '#FAFAFA',
    letterSpacing: -0.4,
  },

  // Bottom zone
  bottomZone: {
    justifyContent: 'flex-end',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.09)',
    marginBottom: 22,
  },

  // Result bar
  resultBarTrack: {
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#1E1E22',
    marginBottom: 14,
  },
  resultBarYes: {
    backgroundColor: '#22C55E',
    minWidth: 6,
  },
  resultBarDivider: {
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  resultBarNo: {
    backgroundColor: '#EF4444',
    minWidth: 6,
  },

  // Stats line — single compact row
  statsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  yesStatText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: '#22C55E',
    letterSpacing: -0.2,
  },
  voteCountText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
    color: '#52525B',
  },
  noStatText: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: '#EF4444',
    letterSpacing: -0.2,
  },

  // CTA row
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaUrl: {
    flex: 1,
    flexShrink: 1,
    fontFamily: 'DMMono_500Medium',
    fontSize: 13,
    color: '#3F3F46',
    // numberOfLines={1} is enforced inline above
  },
  ctaPill: {
    flexShrink: 0,
    backgroundColor: 'rgba(167,139,250,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.36)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  ctaPillText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#A78BFA',
  },
});
