export type UrgencyTier = "safe" | "warning" | "critical" | "closed";

export function getTimeRemainingMs(expiresAtIso: string) {
  const expiresAt = new Date(expiresAtIso).getTime();
  const now = Date.now();

  if (Number.isNaN(expiresAt)) {
    return 0;
  }

  return Math.max(expiresAt - now, 0);
}

function toTimeParts(expiresAtIso: string) {
  const diffMs = getTimeRemainingMs(expiresAtIso);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { diffMs, minutes, hours, days };
}

export function getUrgencyTier(expiresAtIso: string): UrgencyTier {
  const { diffMs } = toTimeParts(expiresAtIso);
  if (diffMs <= 0) return "closed";
  if (diffMs < 60 * 60 * 1000) return "critical";
  if (diffMs <= 6 * 60 * 60 * 1000) return "warning";
  return "safe";
}

export function getTimeLeftLabel(expiresAtIso: string) {
  const { diffMs, minutes, hours, days } = toTimeParts(expiresAtIso);
  if (diffMs <= 0) {
    return "Closed";
  }

  if (days >= 1) {
    return `Ends in ${days}d`;
  }

  if (hours >= 1) {
    return `Ends in ${hours}h`;
  }

  return `Ends in ${Math.max(minutes, 1)}m`;
}

export function getTimeLeftShortLabel(expiresAtIso: string) {
  const { diffMs, minutes, hours, days } = toTimeParts(expiresAtIso);
  if (diffMs <= 0) {
    return "Closed";
  }

  if (days >= 1) {
    return `${days}d left`;
  }

  if (hours >= 1) {
    return `${hours}h left`;
  }

  return `${Math.max(minutes, 1)}m left`;
}
