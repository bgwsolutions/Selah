import { useCallback, useState } from 'react';
import { GameModeId, PSALMS_DATA, PsalmData, TranslationKey } from './data/psalms';
import { AppSection, Header } from './components/Header';
import { TitleMenu } from './components/TitleMenu';
import { GameBoard } from './components/GameBoard';
import { PracticeReader } from './components/PracticeReader';
import { ProgressView } from './components/ProgressView';
import {
  UserProgressData,
  incrementSessions,
  loadProgress,
  recordVerseAttempt,
  resetProgress,
  saveProgress,
} from './utils/storage';

export default function App() {
  const [section, setSection] = useState<AppSection>('library');
  const [selectedMode, setSelectedMode] = useState<GameModeId>('word_vault');
  const [progress, setProgress] = useState<UserProgressData>(() => loadProgress());

  const [activePsalm, setActivePsalm] = useState<PsalmData>(PSALMS_DATA[0]);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleChangeTranslation = useCallback((translation: TranslationKey) => {
    setProgress((prev) => {
      const updated = { ...prev, translation };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleStartGame = useCallback(
    (psalm: PsalmData, startVerseIndex: number, mode: GameModeId) => {
      setActivePsalm(psalm);
      setActiveVerseIndex(startVerseIndex);
      setSelectedMode(mode);
      setGameKey((k) => k + 1);
      setSection('play');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleQuickPlay = useCallback(() => {
    handleStartGame(activePsalm, 0, selectedMode);
  }, [activePsalm, selectedMode, handleStartGame]);

  const handleOpenPractice = useCallback((psalm: PsalmData) => {
    setActivePsalm(psalm);
    setSection('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRecordVerse = useCallback(
    (
      psalmNumber: number,
      verseNumber: number,
      accuracy: number,
      scoreEarned: number,
      streakAchieved: number,
      mode: GameModeId
    ) => {
      setProgress((prev) =>
        recordVerseAttempt(
          prev,
          psalmNumber,
          verseNumber,
          accuracy,
          scoreEarned,
          streakAchieved,
          mode
        )
      );
    },
    []
  );

  const handleSessionComplete = useCallback(() => {
    setProgress((prev) => incrementSessions(prev));
  }, []);

  const handleResetProgress = useCallback(() => {
    setProgress(resetProgress());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F5] text-[#14221D]">
      <Header
        activeSection={section}
        onNavigate={(next) => {
          setSection(next);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickPlay={handleQuickPlay}
      />

      <div className="flex-1">
        {section === 'library' && (
          <TitleMenu
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            translation={progress.translation}
            onChangeTranslation={handleChangeTranslation}
            progress={progress}
            onStartGame={handleStartGame}
            onOpenPractice={handleOpenPractice}
          />
        )}

        {section === 'play' && (
          <GameBoard
            key={`${activePsalm.number}-${activeVerseIndex}-${gameKey}`}
            psalm={activePsalm}
            initialVerseIndex={activeVerseIndex}
            initialMode={selectedMode}
            translation={progress.translation}
            onChangeTranslation={handleChangeTranslation}
            onRecordVerse={handleRecordVerse}
            onSessionComplete={handleSessionComplete}
            onExit={() => setSection('library')}
          />
        )}

        {section === 'practice' && (
          <PracticeReader
            initialPsalm={activePsalm}
            translation={progress.translation}
            onChangeTranslation={handleChangeTranslation}
            progress={progress}
            selectedMode={selectedMode}
            onLaunchGame={handleStartGame}
          />
        )}

        {section === 'progress' && (
          <ProgressView
            progress={progress}
            selectedMode={selectedMode}
            onStartVerse={handleStartGame}
            onResetProgress={handleResetProgress}
          />
        )}
      </div>

      <footer className="border-t border-[#14221D]/10 bg-white/60 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#14221D]/60">
          <span>Selah · Psalms Memorization Game</span>
          <span>Scripture texts: World English Bible (WEB) &amp; King James Version (KJV), Public Domain</span>
        </div>
      </footer>
    </div>
  );
}
