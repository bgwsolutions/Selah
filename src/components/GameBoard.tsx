import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Eye,
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  GAME_MODES,
  GameModeId,
  PsalmData,
  TranslationKey,
  WordToken,
  tokenizeVerse,
} from '../data/psalms';
import { soundFX } from '../utils/audio';

type GameState = 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'GAME_OVER';
type VaultDensity = 'gentle' | 'standard' | 'mastery';

interface RoundResult {
  verseNumber: number;
  accuracy: number;
  score: number;
  hintsUsed: number;
}

interface GameBoardProps {
  psalm: PsalmData;
  initialVerseIndex: number;
  initialMode: GameModeId;
  translation: TranslationKey;
  onChangeTranslation: (t: TranslationKey) => void;
  onRecordVerse: (
    psalmNumber: number,
    verseNumber: number,
    accuracy: number,
    scoreEarned: number,
    streakAchieved: number,
    mode: GameModeId
  ) => void;
  onSessionComplete: () => void;
  onExit: () => void;
}

const DISTRACTOR_POOL = [
  'shepherd',
  'mercy',
  'peace',
  'refuge',
  'strength',
  'waters',
  'righteous',
  'heart',
  'spirit',
  'glory',
  'kingdom',
  'forever',
  'light',
  'truth',
  'heaven',
  'earth',
  'rock',
  'praise',
  'trust',
  'shelter',
  'morning',
  'gladness',
  'counsel',
  'blessed',
];

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  psalm,
  initialVerseIndex,
  initialMode,
  translation,
  onChangeTranslation,
  onRecordVerse,
  onSessionComplete,
  onExit,
}) => {
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [mode, setMode] = useState<GameModeId>(initialMode);
  const [verseIdx, setVerseIdx] = useState<number>(initialVerseIndex);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestSessionStreak, setBestSessionStreak] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(() => soundFX.isMuted());
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  // Per-round tracking
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showPeek, setShowPeek] = useState<boolean>(false);
  const [showContext, setShowContext] = useState<boolean>(false);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const peekTimerRef = useRef<number | null>(null);

  // Mode 1: Word Vault state
  const [vaultDensity, setVaultDensity] = useState<VaultDensity>('standard');
  const [vaultFilled, setVaultFilled] = useState<Record<number, boolean>>({});
  const [activeBlankIdx, setActiveBlankIdx] = useState<number | null>(null);

  // Mode 2: Verse Builder state
  const [builderCursor, setBuilderCursor] = useState<number>(0);

  // Mode 3: First-Letter Recall state
  const [letterCursor, setLetterCursor] = useState<number>(0);

  // Mode 4: Fade & Recite state
  const [fadeStage, setFadeStage] = useState<number>(1); // 1..4
  const [fadeRevealed, setFadeRevealed] = useState<Record<number, boolean>>({});

  const currentVerse = psalm.verses[verseIdx] ?? psalm.verses[0];
  const verseText = currentVerse[translation];
  const tokens: WordToken[] = useMemo(() => tokenizeVerse(verseText), [verseText]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (peekTimerRef.current) {
        window.clearTimeout(peekTimerRef.current);
      }
    };
  }, []);

  // --- Mode 1: Word Vault Blank Indices & Bank ---
  const vaultBlankIndices = useMemo(() => {
    const ratio = vaultDensity === 'gentle' ? 0.28 : vaultDensity === 'standard' ? 0.45 : 0.68;
    const targetCount = Math.max(2, Math.round(tokens.length * ratio));
    const candidates = tokens
      .filter((t) => t.clean.length >= 3)
      .map((t) => t.index);
    const fallback = tokens.map((t) => t.index).filter((i) => !candidates.includes(i));
    const orderedCandidates = deterministicShuffle(candidates, psalm.number * 31 + currentVerse.verse);
    const combined = [...orderedCandidates, ...fallback];
    return combined.slice(0, Math.min(targetCount, tokens.length)).sort((a, b) => a - b);
  }, [tokens, vaultDensity, psalm.number, currentVerse.verse]);

  const vaultBank = useMemo(() => {
    const requiredWords = vaultBlankIndices.map((idx) => ({
      id: `req-${idx}`,
      word: tokens[idx]?.clean ?? '',
      norm: (tokens[idx]?.clean ?? '').toLowerCase(),
    }));
    const usedNorms = new Set(requiredWords.map((w) => w.norm));
    const distractors = deterministicShuffle(
      DISTRACTOR_POOL.filter((w) => !usedNorms.has(w.toLowerCase())),
      psalm.number + currentVerse.verse * 7
    )
      .slice(0, 3)
      .map((word, idx) => ({
        id: `dist-${idx}`,
        word,
        norm: word.toLowerCase(),
      }));

    return deterministicShuffle(
      [...requiredWords, ...distractors],
      psalm.number * 13 + currentVerse.verse * 19 + vaultDensity.length
    );
  }, [vaultBlankIndices, tokens, psalm.number, currentVerse.verse, vaultDensity]);

  // --- Mode 2: Verse Builder Chunks ---
  const builderChunks = useMemo(() => {
    const chunkSize = tokens.length > 16 ? 2 : 1;
    const chunks: { id: number; text: string }[] = [];
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const slice = tokens.slice(i, i + chunkSize);
      chunks.push({
        id: chunks.length,
        text: slice.map((t) => t.raw).join(' '),
      });
    }
    return chunks;
  }, [tokens]);

  const shuffledBuilderChunks = useMemo(() => {
    return deterministicShuffle(builderChunks, psalm.number * 17 + currentVerse.verse * 23);
  }, [builderChunks, psalm.number, currentVerse.verse]);

  // --- Mode 4: Fade & Recite Hidden Indices ---
  const fadeHiddenSet = useMemo(() => {
    if (fadeStage === 1) return new Set<number>();
    if (fadeStage === 4) return new Set<number>(tokens.map((t) => t.index));
    const ratio = fadeStage === 2 ? 0.38 : 0.72;
    const count = Math.max(1, Math.round(tokens.length * ratio));
    const shuffled = deterministicShuffle(
      tokens.map((t) => t.index),
      psalm.number * 29 + currentVerse.verse * 11 + fadeStage
    );
    return new Set(shuffled.slice(0, count));
  }, [tokens, fadeStage, psalm.number, currentVerse.verse]);

  // Reset per-round state cleanly whenever verse, mode, or translation changes
  const resetRoundState = useCallback(() => {
    setMistakes(0);
    setHintsUsed(0);
    setShowPeek(false);
    setVaultFilled({});
    setBuilderCursor(0);
    setLetterCursor(0);
    setFadeStage(1);
    setFadeRevealed({});
    setShakeKey(null);
  }, []);

  useEffect(() => {
    resetRoundState();
  }, [verseIdx, mode, translation, vaultDensity, resetRoundState]);

  // Keep activeBlankIdx synced to first unfilled blank
  useEffect(() => {
    if (mode !== 'word_vault') return;
    if (activeBlankIdx !== null && vaultBlankIndices.includes(activeBlankIdx) && !vaultFilled[activeBlankIdx]) {
      return;
    }
    const next = vaultBlankIndices.find((idx) => !vaultFilled[idx]) ?? null;
    setActiveBlankIdx(next);
  }, [mode, vaultBlankIndices, vaultFilled, activeBlankIdx]);

  const finishRound = useCallback(
    (totalSteps: number, extraBonus = 0) => {
      const penalty = mistakes * 8 + hintsUsed * 10;
      const accuracy = Math.max(25, Math.min(100, Math.round(100 - (penalty / Math.max(1, totalSteps)) * 8)));
      const roundScore = Math.max(20, totalSteps * 15 + accuracy + extraBonus - hintsUsed * 10);

      setScore((prev) => prev + roundScore);
      setRoundResults((prev) => [
        ...prev,
        {
          verseNumber: currentVerse.verse,
          accuracy,
          score: roundScore,
          hintsUsed,
        },
      ]);

      onRecordVerse(psalm.number, currentVerse.verse, accuracy, roundScore, bestSessionStreak, mode);

      if (verseIdx >= psalm.verses.length - 1) {
        soundFX.playPsalmComplete();
        onSessionComplete();
        setGameState('GAME_OVER');
      } else {
        soundFX.playRoundComplete();
        setGameState('ROUND_SUMMARY');
      }
    },
    [
      mistakes,
      hintsUsed,
      currentVerse.verse,
      onRecordVerse,
      psalm.number,
      psalm.verses.length,
      bestSessionStreak,
      mode,
      verseIdx,
      onSessionComplete,
    ]
  );

  const registerCorrectStep = useCallback(
    (stepNum: number) => {
      soundFX.playCorrect(stepNum);
      setStreak((prev) => {
        const next = prev + 1;
        setBestSessionStreak((b) => Math.max(b, next));
        return next;
      });
    },
    []
  );

  const registerMistake = useCallback((key: string) => {
    soundFX.playWrong();
    setMistakes((m) => m + 1);
    setStreak(0);
    setShakeKey(key);
    window.setTimeout(() => setShakeKey(null), 220);
  }, []);

  // --- Mode 1 Handler: Word Vault ---
  const handleVaultPick = (bankItem: { id: string; word: string; norm: string }) => {
    if (gameState !== 'PLAYING' || activeBlankIdx === null) return;
    const expected = tokens[activeBlankIdx]?.clean.toLowerCase();
    if (bankItem.norm === expected) {
      const updated = { ...vaultFilled, [activeBlankIdx]: true };
      setVaultFilled(updated);
      const filledCount = Object.keys(updated).length;
      registerCorrectStep(filledCount - 1);

      if (filledCount >= vaultBlankIndices.length) {
        finishRound(vaultBlankIndices.length);
      } else {
        const nextUnfilled = vaultBlankIndices.find((idx) => !updated[idx]) ?? null;
        setActiveBlankIdx(nextUnfilled);
      }
    } else {
      registerMistake(bankItem.id);
    }
  };

  // --- Mode 2 Handler: Verse Builder ---
  const handleBuilderTap = (chunk: { id: number; text: string }) => {
    if (gameState !== 'PLAYING') return;
    if (chunk.id === builderCursor) {
      const nextCursor = builderCursor + 1;
      setBuilderCursor(nextCursor);
      registerCorrectStep(builderCursor);
      if (nextCursor >= builderChunks.length) {
        finishRound(builderChunks.length);
      }
    } else {
      registerMistake(`chunk-${chunk.id}`);
    }
  };

  // --- Mode 3 Handler: First-Letter Recall ---
  const handleLetterInput = useCallback(
    (char: string) => {
      if (gameState !== 'PLAYING' || mode !== 'first_letter') return;
      if (letterCursor >= tokens.length) return;

      const normalized = char.toLowerCase();
      if (!/^[a-z0-9]$/.test(normalized)) return;

      const expected = tokens[letterCursor].firstLetter;
      if (normalized === expected) {
        const nextCursor = letterCursor + 1;
        setLetterCursor(nextCursor);
        registerCorrectStep(letterCursor);
        if (nextCursor >= tokens.length) {
          finishRound(tokens.length);
        }
      } else {
        registerMistake(`letter-${normalized}`);
      }
    },
    [gameState, mode, letterCursor, tokens, registerCorrectStep, finishRound, registerMistake]
  );

  // Physical keyboard listener for First-Letter Recall
  useEffect(() => {
    if (mode !== 'first_letter' || gameState !== 'PLAYING') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        handleLetterInput(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, gameState, handleLetterInput]);

  // Quick-tap letter choices for First-Letter Recall (works on touch/mouse seamlessly)
  const letterPadChoices = useMemo(() => {
    if (letterCursor >= tokens.length) return [];
    const target = tokens[letterCursor].firstLetter;
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').filter((l) => l !== target);
    const distractors = deterministicShuffle(
      alphabet,
      psalm.number * 37 + currentVerse.verse * 13 + letterCursor
    ).slice(0, 7);
    return deterministicShuffle([target, ...distractors], letterCursor * 17 + psalm.number).sort();
  }, [letterCursor, tokens, psalm.number, currentVerse.verse]);

  // --- Hints ---
  const handleRevealNextHint = () => {
    if (gameState !== 'PLAYING') return;
    soundFX.playHint();
    setHintsUsed((h) => h + 1);

    if (mode === 'word_vault' && activeBlankIdx !== null) {
      const updated = { ...vaultFilled, [activeBlankIdx]: true };
      setVaultFilled(updated);
      const filledCount = Object.keys(updated).length;
      if (filledCount >= vaultBlankIndices.length) {
        finishRound(vaultBlankIndices.length);
      }
    } else if (mode === 'verse_builder' && builderCursor < builderChunks.length) {
      const next = builderCursor + 1;
      setBuilderCursor(next);
      if (next >= builderChunks.length) {
        finishRound(builderChunks.length);
      }
    } else if (mode === 'first_letter' && letterCursor < tokens.length) {
      const next = letterCursor + 1;
      setLetterCursor(next);
      if (next >= tokens.length) {
        finishRound(tokens.length);
      }
    } else if (mode === 'fade_recite') {
      const hiddenIdx = tokens.find((t) => fadeHiddenSet.has(t.index) && !fadeRevealed[t.index])?.index;
      if (hiddenIdx !== undefined) {
        setFadeRevealed((prev) => ({ ...prev, [hiddenIdx]: true }));
      }
    }
  };

  const handlePeekVerse = () => {
    if (gameState !== 'PLAYING') return;
    soundFX.playHint();
    setHintsUsed((h) => h + 1);
    setShowPeek(true);
    if (peekTimerRef.current) window.clearTimeout(peekTimerRef.current);
    peekTimerRef.current = window.setTimeout(() => {
      setShowPeek(false);
    }, 2400);
  };

  const toggleMute = () => {
    const next = !muted;
    soundFX.setMuted(next);
    setMuted(next);
  };

  const handleRestartPsalm = () => {
    setVerseIdx(0);
    setScore(0);
    setStreak(0);
    setBestSessionStreak(0);
    setRoundResults([]);
    resetRoundState();
    setGameState('PLAYING');
  };

  const handleNextVerse = () => {
    if (verseIdx < psalm.verses.length - 1) {
      setVerseIdx((v) => v + 1);
      setGameState('PLAYING');
    } else {
      setGameState('GAME_OVER');
    }
  };

  const currentModeInfo = GAME_MODES.find((m) => m.id === mode) ?? GAME_MODES[0];

  // Track which bank items are already consumed in Word Vault (handles duplicate words cleanly)
  const consumedBankIds = useMemo(() => {
    const filledWordsCount: Record<string, number> = {};
    for (const idx of vaultBlankIndices) {
      if (vaultFilled[idx]) {
        const w = tokens[idx]?.clean.toLowerCase();
        if (w) filledWordsCount[w] = (filledWordsCount[w] ?? 0) + 1;
      }
    }
    const consumed = new Set<string>();
    for (const item of vaultBank) {
      if ((filledWordsCount[item.norm] ?? 0) > 0) {
        consumed.add(item.id);
        filledWordsCount[item.norm] -= 1;
      }
    }
    return consumed;
  }, [vaultBlankIndices, vaultFilled, tokens, vaultBank]);

  const totalAccuracy =
    roundResults.length > 0
      ? Math.round(roundResults.reduce((s, r) => s + r.accuracy, 0) / roundResults.length)
      : 100;

  return (
    <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Tidy Top Game HUD */}
      <div className="bg-white border border-[#14221D]/10 rounded-xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#14221D]/75 hover:text-[#14221D] bg-[#F6F7F5] rounded-lg hover:bg-[#ECEFEA] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit</span>
          </button>
          <div>
            <p className="font-serif-display text-lg font-semibold text-[#14221D] leading-tight">
              Psalm {psalm.number}:{currentVerse.verse}
            </p>
            <p className="text-xs text-[#14221D]/60">
              Verse {verseIdx + 1} of {psalm.verses.length} · {currentModeInfo.name}
            </p>
          </div>
        </div>

        {/* Numeric HUD Meters */}
        <div className="flex items-center gap-5 sm:gap-7">
          <div className="text-right">
            <p className="text-[11px] font-medium text-[#14221D]/55">Streak</p>
            <p className="font-mono text-base font-semibold text-[#B45309] tabular-nums">
              {streak}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium text-[#14221D]/55">Score</p>
            <p className="font-mono text-base font-semibold text-[#14221D] tabular-nums">
              {score}
            </p>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#14221D]/10 pl-4">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
              title={muted ? 'Unmute sound' : 'Mute sound'}
              className="p-2 text-[#14221D]/70 hover:text-[#14221D] hover:bg-[#F6F7F5] rounded-lg transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setGameState(gameState === 'PAUSED' ? 'PLAYING' : 'PAUSED')}
              aria-label={gameState === 'PAUSED' ? 'Resume game' : 'Pause game'}
              title={gameState === 'PAUSED' ? 'Resume' : 'Pause'}
              className="p-2 text-[#14221D]/70 hover:text-[#14221D] hover:bg-[#F6F7F5] rounded-lg transition-colors cursor-pointer"
            >
              {gameState === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mode & Translation Switcher Bar (below HUD) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center p-1 bg-[#EAECE8] rounded-lg overflow-x-auto max-w-full"
          role="group"
          aria-label="Game Mode Switcher"
        >
          {GAME_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setGameState('PLAYING');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === m.id
                  ? 'bg-white text-[#14221D] shadow-xs'
                  : 'text-[#14221D]/65 hover:text-[#14221D]'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {mode === 'word_vault' && (
            <div
              className="inline-flex items-center p-1 bg-[#EAECE8] rounded-lg"
              role="group"
              aria-label="Blank Density"
            >
              {(['gentle', 'standard', 'mastery'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setVaultDensity(d)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    vaultDensity === d
                      ? 'bg-white text-[#14221D] shadow-xs'
                      : 'text-[#14221D]/65 hover:text-[#14221D]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => onChangeTranslation(translation === 'WEB' ? 'KJV' : 'WEB')}
            className="px-3 py-1.5 text-xs font-medium text-[#14221D]/80 bg-white border border-[#14221D]/15 rounded-lg hover:bg-[#F6F7F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {translation === 'WEB' ? 'Modern Clear (WEB)' : 'Classic (KJV)'}
          </button>
        </div>
      </div>

      {/* Main Interactive Game Stage */}
      <section className="bg-white border border-[#14221D]/10 rounded-xl p-6 sm:p-10 space-y-8 relative">
        {/* Progress bar across Psalm */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#14221D]/60">
            <span>{psalm.title}</span>
            <span className="font-mono tabular-nums">
              {verseIdx + 1} / {psalm.verses.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#ECEFEA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#166534] transition-all duration-300"
              style={{ width: `${((verseIdx + (gameState === 'ROUND_SUMMARY' || gameState === 'GAME_OVER' ? 1 : 0)) / psalm.verses.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Optional Context Previous Verse */}
        {showContext && verseIdx > 0 && (
          <div className="p-4 bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg text-sm text-[#14221D]/75">
            <span className="font-mono text-xs font-semibold text-[#14221D]/60 mr-2">
              v.{psalm.verses[verseIdx - 1].verse}
            </span>
            {psalm.verses[verseIdx - 1][translation]}
          </div>
        )}

        {/* Temporary Quick Peek Overlay Banner */}
        {showPeek && (
          <div className="p-4 bg-[#FEF3C7]/60 border border-[#B45309]/25 rounded-lg">
            <p className="text-xs font-semibold text-[#92400E] mb-1">Quick Peek</p>
            <p className="font-serif-display text-lg text-[#14221D] leading-relaxed">
              {verseText}
            </p>
          </div>
        )}

        {/* PLAYING STATE */}
        {gameState === 'PLAYING' && (
          <div className="space-y-8">
            <p className="text-sm text-[#14221D]/65">{currentModeInfo.howToPlay}</p>

            {/* MODE 1: WORD VAULT */}
            {mode === 'word_vault' && (
              <div className="space-y-8">
                <div className="font-serif-display text-xl sm:text-2xl leading-[2.1] text-[#14221D]">
                  <span className="font-mono text-sm font-semibold text-[#14221D]/45 mr-3 select-none">
                    {currentVerse.verse}
                  </span>
                  {tokens.map((t) => {
                    const isBlank = vaultBlankIndices.includes(t.index);
                    const isFilled = Boolean(vaultFilled[t.index]);
                    const isActive = activeBlankIdx === t.index;

                    if (!isBlank || isFilled) {
                      return (
                        <span
                          key={t.index}
                          className={`inline-block mr-1.5 transition-colors ${
                            isBlank && isFilled ? 'text-[#166534] font-semibold' : ''
                          }`}
                        >
                          {t.raw}
                        </span>
                      );
                    }

                    const blankOrder = vaultBlankIndices.indexOf(t.index) + 1;
                    return (
                      <span key={t.index} className="inline-flex items-baseline mr-1.5">
                        {t.leadingPunct && <span>{t.leadingPunct}</span>}
                        <button
                          type="button"
                          onClick={() => setActiveBlankIdx(t.index)}
                          className={`inline-flex items-center justify-center min-w-[76px] h-9 px-2.5 rounded-lg font-sans text-sm font-medium border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#166534]/10 border-[#166534] text-[#166534] ring-2 ring-[#166534]/20'
                              : 'bg-[#F6F7F5] border-[#14221D]/20 text-[#14221D]/55 hover:border-[#14221D]/40'
                          }`}
                        >
                          <span className="font-mono text-xs mr-1">{blankOrder}.</span>
                          <span className="tracking-widest">____</span>
                        </button>
                        {t.trailingPunct && <span>{t.trailingPunct}</span>}
                      </span>
                    );
                  })}
                </div>

                {/* Word Bank */}
                <div className="pt-6 border-t border-[#14221D]/10 space-y-3">
                  <p className="text-xs font-medium text-[#14221D]/60">
                    Word Bank — tap the word for blank #{activeBlankIdx !== null ? vaultBlankIndices.indexOf(activeBlankIdx) + 1 : 1}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {vaultBank.map((item) => {
                      const isUsed = consumedBankIds.has(item.id);
                      const isShaking = shakeKey === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isUsed}
                          onClick={() => handleVaultPick(item)}
                          className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                            isUsed
                              ? 'bg-[#F6F7F5] border-[#14221D]/5 text-[#14221D]/25 cursor-default'
                              : isShaking
                                ? 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B] animate-shake'
                                : 'bg-white border-[#14221D]/20 text-[#14221D] hover:border-[#166534] hover:bg-[#F6F7F5] active:scale-[0.97]'
                          }`}
                        >
                          {item.word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: VERSE BUILDER */}
            {mode === 'verse_builder' && (
              <div className="space-y-8">
                {/* Assembly Board */}
                <div className="min-h-[120px] p-5 bg-[#F6F7F5] border border-[#14221D]/12 rounded-xl">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                    <span className="font-mono text-sm font-semibold text-[#14221D]/45 mr-1">
                      {currentVerse.verse}
                    </span>
                    {builderChunks.slice(0, builderCursor).map((chunk) => (
                      <span
                        key={chunk.id}
                        className="font-serif-display text-xl text-[#14221D] px-2 py-1 bg-white border border-[#166534]/30 rounded-md"
                      >
                        {chunk.text}
                      </span>
                    ))}
                    {builderCursor < builderChunks.length && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-md border border-dashed border-[#166534] text-xs font-medium text-[#166534]">
                        Next phrase ({builderCursor + 1} of {builderChunks.length})
                      </span>
                    )}
                  </div>
                </div>

                {/* Scrambled Tile Tray */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-[#14221D]/60">
                      Phrase Tiles — tap in order
                    </p>
                    {builderCursor > 0 && (
                      <button
                        type="button"
                        onClick={() => setBuilderCursor(0)}
                        className="text-xs font-medium text-[#14221D]/65 hover:text-[#14221D] cursor-pointer"
                      >
                        Reset Order
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {shuffledBuilderChunks.map((chunk) => {
                      const isPlaced = chunk.id < builderCursor;
                      const isShaking = shakeKey === `chunk-${chunk.id}`;
                      return (
                        <button
                          key={chunk.id}
                          type="button"
                          disabled={isPlaced}
                          onClick={() => handleBuilderTap(chunk)}
                          className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
                            isPlaced
                              ? 'bg-[#ECEFEA] border-transparent text-[#14221D]/25 cursor-default'
                              : isShaking
                                ? 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B] animate-shake'
                                : 'bg-white border-[#14221D]/20 text-[#14221D] hover:border-[#166534] hover:bg-[#F6F7F5] active:scale-[0.97]'
                          }`}
                        >
                          {chunk.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 3: FIRST-LETTER RECALL */}
            {mode === 'first_letter' && (
              <div className="space-y-8">
                <div className="font-serif-display text-xl sm:text-2xl leading-[2] text-[#14221D]">
                  <span className="font-mono text-sm font-semibold text-[#14221D]/45 mr-3 select-none">
                    {currentVerse.verse}
                  </span>
                  {tokens.map((t) => {
                    const isSolved = t.index < letterCursor;
                    const isCurrent = t.index === letterCursor;
                    const hiddenLen = Math.max(1, t.clean.length - 1);
                    const mask = `${t.clean[0] ?? ''}${'_'.repeat(Math.min(hiddenLen, 7))}`;

                    if (isSolved) {
                      return (
                        <span key={t.index} className="inline-block mr-1.5 text-[#166534] font-medium">
                          {t.raw}
                        </span>
                      );
                    }

                    if (isCurrent) {
                      return (
                        <span
                          key={t.index}
                          className="inline-flex items-center mr-1.5 px-2 py-0.5 rounded-md bg-[#FEF3C7]/75 border border-[#B45309]/40 font-mono text-base sm:text-lg text-[#14221D]"
                        >
                          {t.leadingPunct}?{'_'.repeat(Math.min(hiddenLen, 5))}{t.trailingPunct}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={t.index}
                        className="inline-block mr-1.5 font-mono text-base sm:text-lg text-[#14221D]/45"
                      >
                        {t.leadingPunct}{mask}{t.trailingPunct}
                      </span>
                    );
                  })}
                </div>

                {/* Quick-Tap Letter Pad + Keyboard Support */}
                <div className="pt-6 border-t border-[#14221D]/10 space-y-3">
                  <p className="text-xs font-medium text-[#14221D]/60">
                    Type on your keyboard or tap the opening letter for word {Math.min(letterCursor + 1, tokens.length)} of {tokens.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {letterPadChoices.map((letter) => {
                      const isShaking = shakeKey === `letter-${letter}`;
                      return (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => handleLetterInput(letter)}
                          className={`min-w-[48px] min-h-[48px] px-3 py-2 font-mono text-base font-semibold uppercase rounded-lg border transition-all cursor-pointer ${
                            isShaking
                              ? 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B] animate-shake'
                              : 'bg-white border-[#14221D]/20 text-[#14221D] hover:border-[#166534] hover:bg-[#F6F7F5] active:scale-[0.96]'
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MODE 4: FADE & RECITE */}
            {mode === 'fade_recite' && (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center p-1 bg-[#EAECE8] rounded-lg" role="group" aria-label="Fade stage">
                    {[1, 2, 3, 4].map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => {
                          setFadeStage(stage);
                          setFadeRevealed({});
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          fadeStage === stage
                            ? 'bg-white text-[#14221D] shadow-xs'
                            : 'text-[#14221D]/65 hover:text-[#14221D]'
                        }`}
                      >
                        Stage {stage}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[#14221D]/60">
                    {fadeStage === 1 && 'Full verse visible — read aloud slowly'}
                    {fadeStage === 2 && '38% faded — tap any blank to peek'}
                    {fadeStage === 3 && '72% faded — recite from memory'}
                    {fadeStage === 4 && 'Reference only — full recitation'}
                  </span>
                </div>

                <div className="font-serif-display text-xl sm:text-2xl leading-[2.1] text-[#14221D] min-h-[110px]">
                  <span className="font-mono text-sm font-semibold text-[#14221D]/45 mr-3 select-none">
                    {currentVerse.verse}
                  </span>
                  {tokens.map((t) => {
                    const isHidden = fadeHiddenSet.has(t.index) && !fadeRevealed[t.index];
                    if (!isHidden) {
                      return (
                        <span
                          key={t.index}
                          className={`inline-block mr-1.5 ${
                            fadeRevealed[t.index] ? 'text-[#B45309] underline decoration-[#B45309]/40' : ''
                          }`}
                        >
                          {t.raw}
                        </span>
                      );
                    }
                    return (
                      <button
                        key={t.index}
                        type="button"
                        onClick={() => {
                          setHintsUsed((h) => h + 1);
                          setFadeRevealed((prev) => ({ ...prev, [t.index]: true }));
                        }}
                        title="Tap to peek this word"
                        className="inline-block mr-1.5 px-2 py-0.5 rounded bg-[#EAECE8] hover:bg-[#DCE2DA] text-transparent select-none border-b-2 border-[#14221D]/25 cursor-pointer transition-colors"
                      >
                        {t.clean}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-[#14221D]/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {fadeStage < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFadeStage((s) => Math.min(4, s + 1));
                          setFadeRevealed({});
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
                      >
                        <span>Fade More</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const stageBonus = fadeStage * 10;
                      const peeks = Object.keys(fadeRevealed).length;
                      setMistakes(peeks);
                      finishRound(tokens.length, stageBonus);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>I Recited This Verse</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3-Tier Hint Toolbar */}
            <div className="pt-4 border-t border-[#14221D]/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {mode !== 'fade_recite' && (
                  <button
                    type="button"
                    onClick={handleRevealNextHint}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#14221D]/80 bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg hover:bg-[#ECEFEA] transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Reveal Next</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePeekVerse}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#14221D]/80 bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg hover:bg-[#ECEFEA] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Peek Verse (2s)</span>
                </button>
                {verseIdx > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowContext((c) => !c)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#14221D]/80 bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg hover:bg-[#ECEFEA] transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showContext ? 'Hide Context' : 'Previous Verse'}</span>
                  </button>
                )}
              </div>

              <span className="text-xs font-mono text-[#14221D]/55 tabular-nums">
                Hints: {hintsUsed} · Misses: {mistakes}
              </span>
            </div>
          </div>
        )}

        {/* PAUSED STATE */}
        {gameState === 'PAUSED' && (
          <div className="py-12 text-center space-y-5">
            <h2 className="font-serif-display text-3xl font-semibold text-[#14221D]">
              Session Paused
            </h2>
            <p className="text-sm text-[#14221D]/70 max-w-md mx-auto">
              Take a breath. Your score and current verse progress are preserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGameState('PLAYING')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>
              <button
                type="button"
                onClick={handleRestartPsalm}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Psalm</span>
              </button>
            </div>
          </div>
        )}

        {/* ROUND SUMMARY STATE */}
        {gameState === 'ROUND_SUMMARY' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center gap-2 text-[#166534]">
              <Check className="w-5 h-5" />
              <span className="text-sm font-semibold">
                Psalm {psalm.number}:{currentVerse.verse} Complete
              </span>
            </div>

            <blockquote className="font-serif-display text-xl sm:text-2xl text-[#14221D] leading-relaxed p-5 bg-[#F6F7F5] border border-[#14221D]/10 rounded-xl">
              “{verseText}”
            </blockquote>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-[#14221D]/10">
              <div>
                <p className="text-xs text-[#14221D]/60">Accuracy</p>
                <p className="font-mono text-xl font-semibold text-[#14221D] tabular-nums">
                  {roundResults[roundResults.length - 1]?.accuracy ?? 100}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#14221D]/60">Points Earned</p>
                <p className="font-mono text-xl font-semibold text-[#166534] tabular-nums">
                  +{roundResults[roundResults.length - 1]?.score ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#14221D]/60">Streak</p>
                <p className="font-mono text-xl font-semibold text-[#B45309] tabular-nums">
                  {streak}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  resetRoundState();
                  setGameState('PLAYING');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Verse</span>
              </button>

              <button
                type="button"
                onClick={handleNextVerse}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] cursor-pointer"
              >
                <span>Next Verse (v.{psalm.verses[verseIdx + 1]?.verse})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER / PSALM COMPLETE SUMMARY */}
        {gameState === 'GAME_OVER' && (
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#166534]">
                <Award className="w-6 h-6" />
                <span className="text-sm font-semibold">Psalm Mastery Session Complete</span>
              </div>
              <h2 className="font-serif-display text-3xl font-semibold text-[#14221D]">
                Psalm {psalm.number}: {psalm.title}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#F6F7F5] border border-[#14221D]/10 rounded-xl">
              <div>
                <p className="text-xs text-[#14221D]/60">Total Score</p>
                <p className="font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
                  {score}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#14221D]/60">Avg Accuracy</p>
                <p className="font-mono text-2xl font-semibold text-[#166534] tabular-nums">
                  {totalAccuracy}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[#14221D]/60">Best Streak</p>
                <p className="font-mono text-2xl font-semibold text-[#B45309] tabular-nums">
                  {bestSessionStreak}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#14221D]/60">Verses Played</p>
                <p className="font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
                  {roundResults.length}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestartPsalm}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              {mode !== 'fade_recite' && (
                <button
                  type="button"
                  onClick={() => {
                    const order: GameModeId[] = ['word_vault', 'verse_builder', 'first_letter', 'fade_recite'];
                    const nextMode = order[(order.indexOf(mode) + 1) % order.length];
                    setMode(nextMode);
                    handleRestartPsalm();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
                >
                  <span>Try Next Mode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2.5 text-sm font-medium text-[#14221D]/75 hover:text-[#14221D] cursor-pointer"
              >
                Back to Psalms
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
