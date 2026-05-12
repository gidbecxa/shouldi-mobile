export const en = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  tabs: {
    feed: 'Feed',
    post: 'Post',
    mine: 'Mine',
  },

  // ── Feed Screen ──────────────────────────────────────────────────────────────
  feed: {
    hot: 'Hot',
    recent: 'Recent',
    seeWhoIsWinning: "See who's winning",
    youVotedYes: 'You voted YES',
    youVotedNo: 'You voted NO',
    votes: '{{count}} vote',
    votes_plural: '{{count}} votes',
    endsIn: 'Ends in {{time}}',
    closed: 'Closed',
    active: 'Active',
    emptyFeed: 'Nothing here yet.',
    emptyFeedSub: 'Be the first to ask the crowd something.',
    liveVoters: '{{count}} people voting right now',
    emptyTitle: 'No active questions right now',
    emptySub: 'Post something bold and the crowd will start shaping your answer.',
  },

  // ── Question Detail ──────────────────────────────────────────────────────────
  detail: {
    headerTitle: 'Question',
    votesCount: '{{count}} votes',
    votesCountDetail: '{{count}} votes · {{percent}}% say YES so far',
    sayYes: '{{percent}}% say YES',
    inviteToVote: 'Invite to Vote',
    shareLink: 'Share Link',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    shareSection: 'Share this question',
    voteNow: 'Vote now →',
    previewLabel: "Preview of what you'll share",
    alreadyVotedYes: 'You voted YES ✓',
    alreadyVotedNo: 'You voted NO ✗',
    youVoted: 'You voted {{vote}} ✓',
    timeLeft: '{{time}} left',
    castVote: 'Cast your vote:',
    votingClosed: 'Voting is closed.',
    loading: 'Loading question...',
    menuReport: 'Report Question',
    menuCopyLink: 'Copy Link',
    menuCancel: 'Cancel',
    reportTitle: 'Report question',
    reportBody: 'Choose a reason to help moderation review quickly.',
    reportQuestion: 'Report Question',
    reporting: 'Reporting...',
    reportConfirmTitle: 'Report this question?',
    reportHarmful: 'Harmful',
    reportInappropriate: 'Inappropriate',
    reportSpam: 'Spam',
    reportPersonalAttack: 'Personal Attack',
    reportConfirm: 'Report',
    reportCancel: 'Cancel',
    reportSuccess: 'Question reported. Thank you.',
  },

  // ── Vote Buttons ─────────────────────────────────────────────────────────────
  vote: {
    yes: 'YES',
    no: 'NO',
  },

  // ── Post Screen ──────────────────────────────────────────────────────────────
  post: {
    header: 'Ask the crowd',
    subheader: '{{max}} characters. One clear question.',
    placeholder: 'Type your question...',
    placeholderExamples: [
      'Type your question...',
      "What's on your mind?",
      'Ask the crowd anything...',
      'What would you do?',
      'Let the crowd decide...',
    ],
    categoryLabel: 'Pick a category',
    windowLabel: 'How long should this run?',
    publishButton: 'Ask the Crowd',
    tooLong: 'Too long',
    anonymous: 'Posted anonymously. No account needed.',
    posting: 'Posting...',
    posted: 'Posted. Your question is now live.',
    enterQuestion: 'Enter a question first.',
    signInRequired: 'Sign in is required before posting.',
    categories: {
      Life: 'Life',
      Love: 'Love',
      Career: 'Career',
      Money: 'Money',
      Health: 'Health',
      Fun: 'Fun',
      Other: 'Other',
    },
    durations: {
      '1h': '1h',
      '6h': '6h',
      '24h': '24h',
      '3d': '3d',
    },
    filterLabel: 'What language should your question appear in?',
  },

  // ── My Board Screen ──────────────────────────────────────────────────────────
  mine: {
    header: 'My Board',
    statQuestion: '{{count}} Question',
    statQuestion_plural: '{{count}} Questions',
    statVotes: '{{count}} Total Vote',
    statVotes_plural: '{{count}} Total Votes',
    emptyTitle: 'Nothing here yet',
    emptySub: 'Ask anything. The crowd is ready to vote.',
    emptyCTA: 'Ask the crowd →',
    deleteTitle: 'Delete this question?',
    deleteBody: "This can't be undone. Your votes will be lost.",
    deleteConfirm: 'Delete',
    deleteCancel: 'Cancel',
    deleting: 'Deleting...',
    closedAgo: 'Closed {{time}} ago',
  },

  // ── Share Bottom Sheet ────────────────────────────────────────────────────────
  share: {
    title: 'Share this question',
    subtitle: 'Choose how you want to share',
    imageTitle: 'Share as Image',
    imageSub: 'Best for Instagram Stories & WhatsApp Status',
    linkTitle: 'Share Link',
    linkSub: 'Best for WhatsApp, iMessage, Telegram, X',
    copyLink: 'Copy link',
    cancel: 'Cancel',
    shareMessage: '"{{question}}"\n\n{{percent}}% say YES so far — what do you think?\n\n{{url}}',
  },

  // ── Onboarding ────────────────────────────────────────────────────────────────
  onboarding: {
    slide1Title: 'The crowd decides.',
    slide1Body: 'Got something on your mind? Ask the crowd anything — and get a real YES or NO from real people.',
    slide2Title: 'Vote on theirs.',
    slide2Body: 'Browse real dilemmas from real people. Cast your vote. Watch the results roll in.',
    slide3Title: 'Share the verdict.',
    slide3Body: 'Share your result — and pull more people into the vote.',
    skip: 'Skip',
    next: 'Continue',
    start: "Let's go",
    enter: 'Enter Should I',
  },

  // ── First Vote Nudge ──────────────────────────────────────────────────────────
  nudge: {
    title: 'You just helped someone decide.',
    body: "Got a question of your own? The crowd is listening.",
    cta: 'Ask them something →',
    dismiss: 'Maybe later',
  },

  // ── Settings / Language ────────────────────────────────────────────────────────
  settings: {
    header: 'Settings',
    language: 'Language',
    languageEN: 'English',
    languageFR: 'French',
    notifications: 'Notifications',
    support: 'support@shouldi.fun',
    reportBug: 'Report a bug',
    version: 'Version {{version}}',
  },

  // ── Errors & Toasts ────────────────────────────────────────────────────────────
  errors: {
    contentViolation: "This question can't be posted. Keep it safe and respectful.",
    wellbeingRedirect: "It sounds like you might be going through something tough. You're not alone.",
    alreadyVoted: 'You already voted on this one.',
    generic: 'Something went wrong. Please try again.',
    networkError: 'No connection. Check your internet and try again.',
    questionNotFound: 'This question has expired or been removed.',
  },

  // ── Time formats ──────────────────────────────────────────────────────────────
  time: {
    justNow: 'just now',
    minutesAgo: '{{count}}m ago',
    hoursAgo: '{{count}}h ago',
    daysAgo: '{{count}}d ago',
    inMinutes: '{{count}}m',
    inHours: '{{count}}h',
    inDays: '{{count}}d',
  },
} as const;

export type TranslationKeys = typeof en;
