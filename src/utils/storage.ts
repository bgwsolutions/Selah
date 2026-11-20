import { GameModeId, PSALMS_DATA, TranslationKey } from '../data/psalms';

export interface VerseProgress {
  mastery: number; // 0 to 100
  attempts: number;
  lastPracticedAt: number;
  modesCompleted: GameModeId[];
}

export interface UserProgressData {
  translation: TranslationKey;
  totalScore: number;
  bestStreak: number;
  sessionsCompleted: number;
  verses: Record<string, VerseProgress>; // key: `${psalmNumber}:${verseNumber}`
}

const STORAGE_KEY = 'selah_psalms_progress_v1';

const DEFAULT_PROGRESS: UserProgressData = {
  translation: 'WEB',
  totalScore: 0,
  bestStreak: 0,
  sessionsCompleted: 0,
  verses: {},
};

export function verseKey(psalmNumber: number, verseNumber: number): string {
  return `${psalmNumber}:${verseNumber}`;
}

export function loadProgress(): UserProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, verses: {} };
    const parsed = JSON.parse(raw) as Partial<UserProgressData>;
    return {
      translation: parsed.translation === 'KJV' ? 'KJV' : 'WEB',
      totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
      bestStreak: typeof parsed.bestStreak === 'number' ? parsed.bestStreak : 0,
      sessionsCompleted: typeof parsed.sessionsCompleted === 'number' ? parsed.sessionsCompleted : 0,
      verses: parsed.verses && typeof parsed.verses === 'object' ? parsed.verses : {},
    };
  } catch {
    return { ...DEFAULT_PROGRESS, verses: {} };
  }
}

export function saveProgress(data: UserProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function recordVerseAttempt(
  current: UserProgressData,
  psalmNumber: number,
  verseNumber: number,
  accuracy: number,
  scoreEarned: number,
  streakAchieved: number,
  mode: GameModeId
): UserProgressData {
  const key = verseKey(psalmNumber, verseNumber);
  const existing = current.verses[key] ?? {
    mastery: 0,
    attempts: 0,
    lastPracticedAt: 0,
    modesCompleted: [],
  };

  // Weighted mastery progression: rewards high accuracy and variety of modes
  const modeBonus = existing.modesCompleted.includes(mode) ? 0 : 8;
  const targetMastery = Math.min(100, Math.round(accuracy * 0.85 + modeBonus + (existing.attempts > 0 ? 15 : 0)));
  const newMastery =
    accuracy >= 70
      ? Math.max(existing.mastery, Math.min(100, Math.round(existing.mastery * 0.35 + targetMastery * 0.65)))
      : Math.max(existing.mastery, Math.round(accuracy * 0.5));

  const nextModes = existing.modesCompleted.includes(mode)
    ? existing.modesCompleted
    : [...existing.modesCompleted, mode];

  const updated: UserProgressData = {
    ...current,
    totalScore: current.totalScore + scoreEarned,
    bestStreak: Math.max(current.bestStreak, streakAchieved),
    verses: {
      ...current.verses,
      [key]: {
        mastery: Math.min(100, newMastery),
        attempts: existing.attempts + 1,
        lastPracticedAt: Date.now(),
        modesCompleted: nextModes,
      },
    },
  };

  saveProgress(updated);
  return updated;
}

export function incrementSessions(current: UserProgressData): UserProgressData {
  const updated: UserProgressData = {
    ...current,
    sessionsCompleted: current.sessionsCompleted + 1,
  };
  saveProgress(updated);
  return updated;
}

export function resetProgress(): UserProgressData {
  const fresh: UserProgressData = { ...DEFAULT_PROGRESS, verses: {} };
  saveProgress(fresh);
  return fresh;
}

export function getPsalmMastery(progress: UserProgressData, psalmNumber: number): number {
  const psalm = PSALMS_DATA.find((p) => p.number === psalmNumber);
  if (!psalm || psalm.verses.length === 0) return 0;
  const total = psalm.verses.reduce((sum, v) => {
    const vp = progress.verses[verseKey(psalmNumber, v.verse)];
    return sum + (vp ? vp.mastery : 0);
  }, 0);
  return Math.round(total / psalm.verses.length);
}

export function getGlobalStats(progress: UserProgressData) {
  const totalVerses = PSALMS_DATA.reduce((sum, p) => sum + p.verses.length, 0);
  let masteredCount = 0;
  let masterySum = 0;

  for (const psalm of PSALMS_DATA) {
    for (const v of psalm.verses) {
      const m = progress.verses[verseKey(psalm.number, v.verse)]?.mastery ?? 0;
      masterySum += m;
      if (m >= 80) masteredCount += 1;
    }
  }

  const averageMastery = totalVerses > 0 ? Math.round(masterySum / totalVerses) : 0;

  return {
    totalPsalms: PSALMS_DATA.length,
    totalVerses,
    masteredCount,
    averageMastery,
    bestStreak: progress.bestStreak,
    totalScore: progress.totalScore,
  };
}
