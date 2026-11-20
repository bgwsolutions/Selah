import React, { useMemo, useState } from 'react';
import { Award, BookOpen, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react';
import { GameModeId, PSALMS_DATA, PsalmData } from '../data/psalms';
import { getGlobalStats, getPsalmMastery, UserProgressData, verseKey } from '../utils/storage';

interface ProgressViewProps {
  progress: UserProgressData;
  selectedMode: GameModeId;
  onStartVerse: (psalm: PsalmData, verseIndex: number, mode: GameModeId) => void;
  onResetProgress: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  selectedMode,
  onStartVerse,
  onResetProgress,
}) => {
  const [confirmingReset, setConfirmingReset] = useState(false);

  const stats = useMemo(() => getGlobalStats(progress), [progress]);

  // Verses that have been attempted at least once or belong to started psalms and need reinforcement
  const reviewQueue = useMemo(() => {
    const items: { psalm: PsalmData; verseIndex: number; verseNumber: number; mastery: number }[] = [];
    for (const psalm of PSALMS_DATA) {
      psalm.verses.forEach((v, idx) => {
        const vp = progress.verses[verseKey(psalm.number, v.verse)];
        if (vp && vp.mastery < 85) {
          items.push({
            psalm,
            verseIndex: idx,
            verseNumber: v.verse,
            mastery: vp.mastery,
          });
        }
      });
    }
    return items.sort((a, b) => a.mastery - b.mastery).slice(0, 6);
  }, [progress]);

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#14221D]">
            Your Memorization Progress
          </h1>
          <p className="text-sm text-[#14221D]/65 mt-1">
            Progress is saved automatically in this browser across every Psalm and game mode.
          </p>
        </div>

        <div>
          {!confirmingReset ? (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#14221D]/70 bg-white border border-[#14221D]/15 rounded-lg hover:text-[#DC2626] hover:border-[#DC2626]/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-white border border-[#DC2626]/30 rounded-lg p-1.5">
              <span className="text-xs font-medium text-[#991B1B] px-2">Clear all scores?</span>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmingReset(false);
                }}
                className="px-3 py-1 text-xs font-semibold text-white bg-[#DC2626] rounded-md hover:bg-[#B91C1C] cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-3 py-1 text-xs font-medium text-[#14221D]/70 hover:text-[#14221D] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white border border-[#14221D]/10 rounded-xl">
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Verses Mastered</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#166534] tabular-nums">
            {stats.masteredCount} / {stats.totalVerses}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Total Score</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
            {stats.totalScore.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Best Word Streak</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#B45309] tabular-nums">
            {stats.bestStreak}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#14221D]/60">Sessions Completed</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#14221D] tabular-nums">
            {progress.sessionsCompleted}
          </p>
        </div>
      </section>

      {/* Review Queue */}
      {reviewQueue.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif-display text-2xl font-semibold text-[#14221D]">
            Verses Ready for Review
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewQueue.map((item) => (
              <div
                key={`${item.psalm.number}-${item.verseNumber}`}
                className="bg-white border border-[#14221D]/10 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-serif-display text-lg font-semibold text-[#14221D]">
                    Psalm {item.psalm.number}:{item.verseNumber}
                  </p>
                  <p className="text-xs text-[#14221D]/60 mt-0.5 tabular-nums">
                    {item.psalm.title} · Mastery {item.mastery}%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartVerse(item.psalm, item.verseIndex, selectedMode)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chapter-by-Chapter Table */}
      <section className="bg-white border border-[#14221D]/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#14221D]/10">
          <h2 className="font-serif-display text-xl font-semibold text-[#14221D]">
            Chapter Breakdown
          </h2>
        </div>

        <div className="divide-y divide-[#14221D]/10">
          {PSALMS_DATA.map((psalm) => {
            const mastery = getPsalmMastery(progress, psalm.number);
            const status =
              mastery >= 80 ? 'Mastered' : mastery > 0 ? 'In Progress' : 'Not Started';

            return (
              <div
                key={psalm.number}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#14221D]/60">
                    <span className="font-mono font-semibold text-[#14221D]">
                      Psalm {psalm.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{psalm.verses.length} Verses</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#14221D]/80">
                      {status === 'Mastered' && <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />}
                      {status === 'In Progress' && <Clock className="w-3.5 h-3.5 text-[#B45309]" />}
                      {status === 'Not Started' && <BookOpen className="w-3.5 h-3.5 text-[#14221D]/45" />}
                      {status}
                    </span>
                  </div>
                  <p className="font-serif-display text-lg font-medium text-[#14221D] truncate">
                    {psalm.title}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="w-36 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#14221D]/55">Mastery</span>
                      <span className="font-mono font-semibold text-[#14221D] tabular-nums">
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

                  <button
                    type="button"
                    onClick={() => onStartVerse(psalm, 0, selectedMode)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#14221D] bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] transition-colors cursor-pointer"
                  >
                    {mastery >= 80 ? <Award className="w-3.5 h-3.5 text-[#166534]" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{mastery > 0 ? 'Continue' : 'Start'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
