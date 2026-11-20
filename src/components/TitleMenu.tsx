import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Eye,
  Keyboard,
  Layers,
  Play,
  Puzzle,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  DifficultyLevel,
  GAME_MODES,
  GameModeId,
  PSALMS_DATA,
  PSALM_IMAGE_PATHS,
  PsalmData,
  TranslationKey,
} from '../data/psalms';
import { getGlobalStats, getPsalmMastery, UserProgressData, verseKey } from '../utils/storage';
import { ImageWithFallback } from './ImageWithFallback';

interface TitleMenuProps {
  selectedMode: GameModeId;
  onSelectMode: (mode: GameModeId) => void;
  translation: TranslationKey;
  onChangeTranslation: (t: TranslationKey) => void;
  progress: UserProgressData;
  onStartGame: (psalm: PsalmData, startVerseIndex: number, mode: GameModeId) => void;
  onOpenPractice: (psalm: PsalmData) => void;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  selectedMode,
  onSelectMode,
  translation,
  onChangeTranslation,
  progress,
  onStartGame,
  onOpenPractice,
}) => {
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | DifficultyLevel>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [versePickerPsalm, setVersePickerPsalm] = useState<PsalmData | null>(null);

  const stats = useMemo(() => getGlobalStats(progress), [progress]);

  const filteredPsalms = useMemo(() => {
    return PSALMS_DATA.filter((psalm) => {
      const matchesDiff = difficultyFilter === 'All' || psalm.difficulty === difficultyFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        psalm.title.toLowerCase().includes(q) ||
        psalm.theme.toLowerCase().includes(q) ||
        `psalm ${psalm.number}`.includes(q) ||
        String(psalm.number).includes(q);
      return matchesDiff && matchesSearch;
    });
  }, [difficultyFilter, searchQuery]);

  // Recommend the next psalm to play (either partially started or Psalm 23)
  const recommendedPsalm = useMemo(() => {
    const started = PSALMS_DATA.find((p) => {
      const m = getPsalmMastery(progress, p.number);
      return m > 0 && m < 100;
    });
    return started ?? PSALMS_DATA[0];
  }, [progress]);

  const modeIcons: Record<GameModeId, React.ReactNode> = {
    word_vault: <Puzzle className="w-5 h-5 text-[#166534]" />,
    verse_builder: <Layers className="w-5 h-5 text-[#166534]" />,
    first_letter: <Keyboard className="w-5 h-5 text-[#166534]" />,
    fade_recite: <Eye className="w-5 h-5 text-[#166534]" />,
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-[#14221D]/10 rounded-xl p-6 sm:p-10">
          <div className="space-y-5">
            <p className="text-xs font-medium text-[#14221D]/60 tracking-wide">
              Psalms Memorization Game · {translation === 'WEB' ? 'Modern Clear (WEB)' : 'Classic (KJV)'}
            </p>
            <h1 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#14221D] leading-[1.12] tracking-tight text-balance">
              Carry the Psalms in your memory, one verse at a time.
            </h1>
            <p className="text-base text-[#14221D]/75 leading-relaxed max-w-[60ch]">
              Learn beloved chapters through four calm, progressive recall games—from filling key blanks to reciting full verses from memory.
            </p>
          </div>

          <div className="pt-8 mt-8 border-t border-[#14221D]/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartGame(recommendedPsalm, 0, selectedMode)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Psalm {recommendedPsalm.number}</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenPractice(recommendedPsalm)}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read First</span>
              </button>
            </div>

            {/* Translation Switcher */}
            <div
              className="inline-flex items-center p-1 bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg"
              role="group"
              aria-label="Bible Translation"
            >
              <button
                type="button"
                onClick={() => onChangeTranslation('WEB')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  translation === 'WEB'
                    ? 'bg-white text-[#14221D] shadow-xs border border-[#14221D]/10'
                    : 'text-[#14221D]/65 hover:text-[#14221D]'
                }`}
              >
                Modern Clear
              </button>
              <button
                type="button"
                onClick={() => onChangeTranslation('KJV')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  translation === 'KJV'
                    ? 'bg-white text-[#14221D] shadow-xs border border-[#14221D]/10'
                    : 'text-[#14221D]/65 hover:text-[#14221D]'
                }`}
              >
                Classic KJV
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl overflow-hidden border border-[#14221D]/10 bg-white min-h-[260px]">
          <ImageWithFallback
            src={PSALM_IMAGE_PATHS.manuscript}
            alt="Open linen-bound book of Psalms on a sunlit oak table beside an olive sprig"
            fallbackLabel="Book of Psalms"
            className="w-full h-full lg:h-full object-cover"
          />
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section
        aria-label="Your Memorization Summary"
        className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 px-6 bg-white border border-[#14221D]/10 rounded-xl"
      >
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Psalms Collection</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
            {stats.totalPsalms} Chapters
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Verses Mastered</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
            {stats.masteredCount} / {stats.totalVerses}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Best Word Streak</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
            {stats.bestStreak}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Overall Mastery</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#166534] tabular-nums">
            {stats.averageMastery}%
          </p>
        </div>
      </section>

      {/* Step 1: Choose Game Mode */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-serif-display text-2xl font-semibold text-[#14221D]">
              01. Choose How You Play
            </h2>
            <p className="text-sm text-[#14221D]/65 mt-1">
              Select a recall method suited to how well you already know the passage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id)}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534] ${
                  isSelected
                    ? 'bg-white border-[#166534] ring-1 ring-[#166534]'
                    : 'bg-white border-[#14221D]/10 hover:border-[#14221D]/30'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    {modeIcons[mode.id]}
                    {isSelected && (
                      <span className="text-xs font-semibold text-[#166534] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#14221D]">{mode.name}</h3>
                  <p className="text-sm text-[#14221D]/70 leading-snug">{mode.shortDesc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: Psalm Library */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-display text-2xl font-semibold text-[#14221D]">
              02. Pick a Psalm to Memorize
            </h2>
            <p className="text-sm text-[#14221D]/65 mt-1">
              Play through an entire Psalm verse-by-verse, or pick a single verse to drill.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#14221D]/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Psalm or theme..."
                aria-label="Search Psalms"
                className="pl-9 pr-3 py-2 text-sm bg-white border border-[#14221D]/15 rounded-lg text-[#14221D] placeholder:text-[#14221D]/45 focus:outline-none focus:border-[#166534] w-52"
              />
            </div>

            {/* Difficulty Filter */}
            <div
              className="inline-flex items-center p-1 bg-[#EAECE8] rounded-lg"
              role="group"
              aria-label="Filter by difficulty"
            >
              {(['All', 'Beginner', 'Intermediate', 'Challenge'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficultyFilter(level)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    difficultyFilter === level
                      ? 'bg-white text-[#14221D] shadow-xs'
                      : 'text-[#14221D]/65 hover:text-[#14221D]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPsalms.length === 0 ? (
          <div className="bg-white border border-[#14221D]/10 rounded-xl p-10 text-center space-y-3">
            <p className="text-base font-medium text-[#14221D]">No Psalms matched your filter.</p>
            <button
              type="button"
              onClick={() => {
                setDifficultyFilter('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm font-medium text-[#166534] bg-[#F6F7F5] rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPsalms.map((psalm) => {
              const mastery = getPsalmMastery(progress, psalm.number);
              return (
                <article
                  key={psalm.number}
                  className="bg-white border border-[#14221D]/10 rounded-xl overflow-hidden flex flex-col justify-between transition-colors hover:border-[#14221D]/25"
                >
                  <div>
                    <div className="h-36 overflow-hidden border-b border-[#14221D]/10 bg-[#ECEFEA]">
                      <ImageWithFallback
                        src={PSALM_IMAGE_PATHS[psalm.image]}
                        alt={`Illustration for Psalm ${psalm.number}`}
                        fallbackLabel={`Psalm ${psalm.number}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-2.5">
                      {/* Clean unboxed metadata */}
                      <div className="flex items-center gap-2 text-xs text-[#14221D]/60">
                        <span className="font-mono font-medium text-[#14221D]/80">
                          Psalm {psalm.number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{psalm.verses.length} Verses</span>
                        <span aria-hidden="true">·</span>
                        <span>{psalm.difficulty}</span>
                      </div>

                      <h3 className="font-serif-display text-xl font-semibold text-[#14221D] leading-snug">
                        {psalm.title}
                      </h3>
                      <p className="text-sm text-[#14221D]/70 leading-relaxed line-clamp-2">
                        {psalm.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 space-y-4">
                    {/* Mastery Meter */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#14221D]/60">Mastery</span>
                        <span className="font-mono font-medium text-[#14221D] tabular-nums">
                          {mastery}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#ECEFEA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#166534] transition-all duration-300"
                          style={{ width: `${mastery}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStartGame(psalm, 0, selectedMode)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#166534] rounded-lg hover:bg-[#14532D] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Psalm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVersePickerPsalm(psalm)}
                        className="px-3 py-2 text-sm font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/10 rounded-lg hover:bg-[#ECEFEA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Pick Verse
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Verse Picker Modal */}
      {versePickerPsalm && (
        <div
          className="fixed inset-0 z-50 bg-[#14221D]/45 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verse-picker-title"
        >
          <div className="bg-white border border-[#14221D]/15 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-[#14221D]/10 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#14221D]/60">
                  Psalm {versePickerPsalm.number} · {GAME_MODES.find((m) => m.id === selectedMode)?.name}
                </p>
                <h3 id="verse-picker-title" className="font-serif-display text-xl font-semibold text-[#14221D]">
                  {versePickerPsalm.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVersePickerPsalm(null)}
                className="px-3 py-1.5 text-sm font-medium text-[#14221D]/70 hover:text-[#14221D] bg-[#F6F7F5] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {versePickerPsalm.verses.map((v, idx) => {
                const vp = progress.verses[verseKey(versePickerPsalm.number, v.verse)];
                const mastery = vp?.mastery ?? 0;
                return (
                  <button
                    key={v.verse}
                    type="button"
                    onClick={() => {
                      const target = versePickerPsalm;
                      setVersePickerPsalm(null);
                      onStartGame(target, idx, selectedMode);
                    }}
                    className="w-full text-left p-4 rounded-lg border border-[#14221D]/10 hover:border-[#166534] hover:bg-[#F6F7F5] transition-colors flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#14221D]/60">
                        <span className="font-mono font-semibold text-[#14221D]">
                          Verse {v.verse}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">Mastery {mastery}%</span>
                      </div>
                      <p className="text-sm text-[#14221D]/85 leading-relaxed">
                        {v[translation]}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] shrink-0 pt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Play
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
