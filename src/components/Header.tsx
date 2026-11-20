import React from 'react';

export type AppSection = 'library' | 'play' | 'practice' | 'progress';

interface HeaderProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onQuickPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onQuickPlay,
}) => {
  const navItems: { id: AppSection; label: string }[] = [
    { id: 'library', label: 'Psalms' },
    { id: 'play', label: 'Play' },
    { id: 'practice', label: 'Practice' },
    { id: 'progress', label: 'Progress' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F6F7F5]/95 backdrop-blur-sm border-b border-[#14221D]/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('library')}
          className="font-serif-display text-2xl font-semibold tracking-tight text-[#14221D] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534] rounded-sm cursor-pointer"
        >
          Selah
        </button>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav className="flex items-center gap-5 sm:gap-7 overflow-x-auto no-scrollbar" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#166534] ${
                  isActive
                    ? 'text-[#14221D] font-semibold'
                    : 'text-[#14221D]/65 hover:text-[#14221D]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#166534]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0 hidden sm:block">
          <button
            type="button"
            onClick={onQuickPlay}
            className="px-4 py-2 text-sm font-medium text-white bg-[#166534] rounded-lg hover:bg-[#14532D] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
          >
            Quick Play
          </button>
        </div>
      </div>
    </header>
  );
};
