import React, { useState } from 'react';
import { Eye, EyeOff, Play, Sparkles } from 'lucide-react';
import {
  GameModeId,
  PSALMS_DATA,
  PsalmData,
  TranslationKey,
  tokenizeVerse,
} from '../data/psalms';
import { UserProgressData, verseKey } from '../utils/storage';

type ReaderMaskMode = 'full' | 'first_letters' | 'hide_every_other';

interface PracticeReaderProps {
  initialPsalm: PsalmData;
  translation: TranslationKey;
  onChangeTranslation: (t: TranslationKey) => void;
  progress: UserProgressData;
  selectedMode: GameModeId;
  onLaunchGame: (psalm: PsalmData, startVerseIndex: number, mode: GameModeId) => void;
}

export const PracticeReader: React.FC<PracticeReaderProps> = ({
  initialPsalm,
  translation,
  onChangeTranslation,
  progress,
  selectedMode,
  onLaunchGame,
}) => {
  const [activePsalm, setActivePsalm] = useState<PsalmData>(initialPsalm);
  const [maskMode, setMaskMode] = useState<ReaderMaskMode>('full');
  const [revealedVerses, setRevealedVerses] = useState<Record<number, boolean>>({});

  const toggleVerseReveal = (verseNum: number) => {
    setRevealedVerses((prev) => ({ ...prev, [verseNum]: !prev[verseNum] }));
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Psalm Selector Sidebar */}
        <aside className="lg:col-span-4 bg-white border border-[#14221D]/10 rounded-xl p-4 space-y-2">
          <p className="px-2 py-1 text-xs font-semibold text-[#14221D]/60">
            Select Chapter
          </p>
          <div className="space-y-1">
            {PSALMS_DATA.map((p) => {
              const isSelected = p.number === activePsalm.number;
              return (
                <button
                  key={p.number}
                  type="button"
                  onClick={() => {
                    setActivePsalm(p);
                    setRevealedVerses({});
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#166534] text-white'
                      : 'text-[#14221D] hover:bg-[#F6F7F5]'
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`font-mono text-xs mr-2 ${isSelected ? 'text-white/80' : 'text-[#14221D]/55'}`}>
                      {p.number}
                    </span>
                    <span className="text-sm font-medium truncate">{p.title}</span>
                  </div>
                  <span className={`text-xs font-mono shrink-0 ${isSelected ? 'text-white/80' : 'text-[#14221D]/45'}`}>
                    {p.verses.length}v
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Study & Recitation Canvas */}
        <section className="lg:col-span-8 bg-white border border-[#14221D]/10 rounded-xl p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#14221D]/10">
            <div>
              <p className="text-xs font-medium text-[#14221D]/60">
                Psalm {activePsalm.number} · {activePsalm.theme} · {activePsalm.verses.length} Verses
              </p>
              <h1 className="font-serif-display text-3xl font-semibold text-[#14221D] mt-1">
                {activePsalm.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => onLaunchGame(activePsalm, 0, selectedMode)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#166534] rounded-lg hover:bg-[#14532D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Psalm {activePsalm.number}</span>
            </button>
          </div>

          {/* Reading Mask & Translation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center p-1 bg-[#EAECE8] rounded-lg" role="group" aria-label="Study Mask">
              {[
                { id: 'full' as const, label: 'Full Text' },
                { id: 'hide_every_other' as const, label: 'Key Blanks' },
                { id: 'first_letters' as const, label: 'First Letters' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setMaskMode(opt.id);
                    setRevealedVerses({});
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    maskMode === opt.id
                      ? 'bg-white text-[#14221D] shadow-xs'
                      : 'text-[#14221D]/65 hover:text-[#14221D]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onChangeTranslation(translation === 'WEB' ? 'KJV' : 'WEB')}
              className="px-3 py-1.5 text-xs font-medium text-[#14221D]/80 bg-[#F6F7F5] border border-[#14221D]/15 rounded-lg hover:bg-[#ECEFEA] cursor-pointer"
            >
              {translation === 'WEB' ? 'Modern Clear (WEB)' : 'Classic (KJV)'}
            </button>
          </div>

          {/* Verses List */}
          <div className="space-y-6">
            {activePsalm.verses.map((v, idx) => {
              const text = v[translation];
              const isPeeked = Boolean(revealedVerses[v.verse]);
              const mastery = progress.verses[verseKey(activePsalm.number, v.verse)]?.mastery ?? 0;
              const tokens = tokenizeVerse(text);

              return (
                <div
                  key={v.verse}
                  className="pb-6 border-b border-[#14221D]/8 last:border-b-0 last:pb-0 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-semibold text-[#14221D]/55">
                      Verse {v.verse} · Mastery {mastery}%
                    </span>
                    <div className="flex items-center gap-2">
                      {maskMode !== 'full' && (
                        <button
                          type="button"
                          onClick={() => toggleVerseReveal(v.verse)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#14221D]/70 hover:text-[#14221D] bg-[#F6F7F5] rounded-md cursor-pointer"
                        >
                          {isPeeked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isPeeked ? 'Mask' : 'Peek'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onLaunchGame(activePsalm, idx, selectedMode)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#166534] hover:bg-[#166534]/10 rounded-md transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Drill Verse</span>
                      </button>
                    </div>
                  </div>

                  <p className="font-serif-display text-lg sm:text-xl leading-relaxed text-[#14221D]">
                    {maskMode === 'full' || isPeeked
                      ? text
                      : maskMode === 'first_letters'
                        ? tokens.map((t) => (
                            <span key={t.index} className="inline-block mr-1.5 font-mono text-base text-[#14221D]/75">
                              {t.leadingPunct}
                              {t.clean[0] ?? ''}
                              {'_'.repeat(Math.max(1, Math.min(t.clean.length - 1, 6)))}
                              {t.trailingPunct}
                            </span>
                          ))
                        : tokens.map((t) => {
                            const hide = t.index % 2 === 1 && t.clean.length >= 3;
                            return (
                              <span
                                key={t.index}
                                className={`inline-block mr-1.5 ${
                                  hide ? 'px-1.5 rounded bg-[#EAECE8] text-transparent select-none' : ''
                                }`}
                              >
                                {t.raw}
                              </span>
                            );
                          })}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};
