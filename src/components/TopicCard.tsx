import {
  Plus, X, ListOrdered, Square, Box, PieChart, Sigma, Dot, AlignLeft,
  Asterisk, Percent, Equal, Route, ChevronRight, HelpCircle,
} from 'lucide-react';
import type { Topic, TopicProgress } from '../lib/types';
import { LEVEL_META } from '../lib/levels';

const ICONS: Record<string, typeof Plus> = {
  plus: Plus, x: X, 'list-ordered': ListOrdered, square: Square, box: Box,
  pie: PieChart, sigma: Sigma, dot: Dot, 'align-left': AlignLeft,
  asterisk: Asterisk, percent: Percent, equal: Equal, route: Route,
};

export function TopicIcon({ icon, size = 20, color }: { icon: string; size?: number; color?: string }) {
  const Cmp = ICONS[icon] ?? HelpCircle;
  return <Cmp size={size} style={color ? { color } : undefined} />;
}

interface Props {
  topic: Topic;
  progress: TopicProgress;
  onOpen: (id: string) => void;
}

export function TopicCard({ topic, progress, onOpen }: Props) {
  const meta = LEVEL_META[progress.level];
  return (
    <button
      onClick={() => onOpen(topic.id)}
      className="hud-panel w-full text-left p-4 cursor-pointer transition-all duration-200 group"
      style={{ borderColor: meta.border }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 24px ${meta.border}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 rounded-lg p-2"
            style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
          >
            <TopicIcon icon={topic.icon} size={18} color={meta.color} />
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate" style={{ color: 'hsl(var(--text))' }}>{topic.title}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: meta.color }}>{meta.label}</div>
          </div>
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: meta.color }}
        />
      </div>
      {(progress.solved > 0 || progress.failed > 0) && (
        <div className="font-hud mt-3 text-xs" style={{ color: 'hsl(var(--text-dim))' }}>
          решено {progress.solved} · ошибок {progress.failed}
          {progress.streak >= 2 && <span style={{ color: 'hsl(var(--cyan))' }}> · серия {progress.streak}</span>}
        </div>
      )}
    </button>
  );
}
