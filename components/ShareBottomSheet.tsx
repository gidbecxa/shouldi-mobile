import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typeScale, typography } from "../constants/typography";
import { PressableScale } from "./PressableScale";
import { SlideUpSheet } from "./SlideUpSheet";

type ShareBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onShareImage: () => void;
  onShareLink: () => void;
  onCopyLink: () => void;
  isSharing?: boolean;
};

function ShareOptionCard({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={{
        borderRadius: spacing.base,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.card,
        padding: spacing.base,
        gap: spacing.xs,
      }}
    >
      <Ionicons name={icon} size={28} color={colors.brand} />
      <Text style={{ ...typeScale.title, color: colors.textPrimary }}>{title}</Text>
      <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>{subtitle}</Text>
    </PressableScale>
  );
}

export function ShareBottomSheet({
  visible,
  onClose,
  onShareImage,
  onShareLink,
  onCopyLink,
  isSharing = false,
}: ShareBottomSheetProps) {
  const { t } = useTranslation();
  return (
    <SlideUpSheet
      visible={visible}
      onClose={onClose}
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
        gap: spacing.md,
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

      <Text style={{ ...typeScale.title, color: colors.textPrimary, textAlign: "center" }}>{t('share.title')}</Text>
      <Text style={{ ...typeScale.caption, color: colors.textSecondary, textAlign: "center" }}>
        {t('share.subtitle')}
      </Text>

      <ShareOptionCard
        icon="image-outline"
        title={t('share.imageTitle')}
        subtitle={t('share.imageSub')}
        onPress={onShareImage}
        disabled={isSharing}
      />

      <ShareOptionCard
        icon="link-outline"
        title={t('share.linkTitle')}
        subtitle={t('share.linkSub')}
        onPress={onShareLink}
        disabled={isSharing}
      />

      <PressableScale onPress={onCopyLink} disabled={isSharing} style={{ alignItems: "center", paddingVertical: spacing.sm }}>
        <Text style={{ ...typeScale.caption, color: colors.brand, fontFamily: typography.bodySemiBold }}>{t('share.copyLink')}</Text>
      </PressableScale>

      <PressableScale onPress={onClose} style={{ alignItems: "center", paddingVertical: spacing.xs }}>
        <Text style={{ ...typeScale.caption, color: colors.textSecondary }}>{t('share.cancel')}</Text>
      </PressableScale>
    </SlideUpSheet>
  );
}
