import React from 'react';
import {
  Wind,
  CalendarCheck,
  Home,
  ArrowLeftRight,
  TrendingDown,
  Users,
  MessageCircle,
} from 'lucide-react';
import { useAppStore, ActiveTabId } from '@/shared/lib/store';

interface TabItem {
  id: ActiveTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'airnow', label: "Today's Air", icon: Wind },
  { id: 'dayplan', label: 'My Day', icon: CalendarCheck },
  { id: 'indoor', label: 'Indoor Hacks', icon: Home },
  { id: 'swaps', label: 'Swaps', icon: ArrowLeftRight },
  { id: 'impact', label: 'Impact', icon: TrendingDown },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'assistant', label: 'Ask Exhale', icon: MessageCircle },
];

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    } else {
      return;
    }
    e.preventDefault();
    setActiveTab(TABS[nextIndex].id);
    const nextElem = document.getElementById(`tab-mobile-${TABS[nextIndex].id}`);
    nextElem?.focus();
  };

  return (
    <>
      {/* Mobile Sticky Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 pb-safe transition-colors no-print shadow-lg"
        aria-label="Mobile section navigation"
      >
        <div
          role="tablist"
          aria-label="Mobile Navigation"
          className="flex items-center justify-around"
        >
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-mobile-${tab.id}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-150 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'text-primary font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'stroke-[2.5]' : 'stroke-2'}`} aria-hidden="true" />
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
