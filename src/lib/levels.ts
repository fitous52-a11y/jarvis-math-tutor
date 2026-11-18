import type { MasteryLevel } from './types';

export const LEVEL_META: Record<MasteryLevel, { label: string; color: string; bg: string; border: string }> = {
  unknown: {
    label: 'Не проверено',
    color: 'hsl(205 25% 65%)',
    bg: 'hsl(205 25% 65% / 0.08)',
    border: 'hsl(205 25% 65% / 0.3)',
  },
  weak: {
    label: 'Уязвимость',
    color: 'hsl(4 85% 68%)',
    bg: 'hsl(4 85% 60% / 0.1)',
    border: 'hsl(4 85% 60% / 0.45)',
  },
  medium: {
    label: 'Требует доработки',
    color: 'hsl(38 95% 62%)',
    bg: 'hsl(38 95% 55% / 0.1)',
    border: 'hsl(38 95% 55% / 0.4)',
  },
  strong: {
    label: 'Прочная броня',
    color: 'hsl(152 70% 55%)',
    bg: 'hsl(152 70% 45% / 0.1)',
    border: 'hsl(152 70% 45% / 0.4)',
  },
};
