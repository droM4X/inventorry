import { Menu, Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  onSearchChange?: (query: string) => void;
}

export function Header({ onMenuClick, title, onSearchChange }: HeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchExpanded) {
        handleCloseSearch();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isSearchExpanded && !target.closest('.search-container')) {
        handleCloseSearch();
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  const handleCloseSearch = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    onSearchChange?.('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>

        {isSearchExpanded ? (
          <div className="search-container absolute left-0 right-0 top-0 h-14 px-4 flex items-center bg-[var(--color-surface)] transition-all duration-200">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-[var(--color-text-secondary)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Keresés..."
                className="w-full h-10 pl-10 pr-10 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
              <button
                onClick={handleCloseSearch}
                className="absolute right-2 p-1.5 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsSearchExpanded(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)] transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
