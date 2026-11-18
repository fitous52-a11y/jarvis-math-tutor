import type { Profile, TopicProgress, MasteryLevel } from './types';
import { TOPICS } from '../data/topics';

const KEY = 'jarvis-tutor-profile-v1';

export function emptyTopicProgress(): TopicProgress {
  return { level: 'unknown', streak: 0, solved: 0, failed: 0, mistakesSeen: [] };
}

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Profile;
      // гарантируем наличие всех тем
      for (const t of TOPICS) {
        if (!p.topics[t.id]) p.topics[t.id] = emptyTopicProgress();
      }
      return p;
    }
  } catch {
    /* повреждённые данные — начинаем заново */
  }
  const topics: Record<string, TopicProgress> = {};
  for (const t of TOPICS) topics[t.id] = emptyTopicProgress();
  return { name: 'Пилот', createdAt: Date.now(), diagnosticDone: false, topics };
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProfile(): Profile {
  localStorage.removeItem(KEY);
  return loadProfile();
}

/** Уровни по итогам диагностики: 2/2 — strong, 1/2 — medium, 0/2 — weak */
export function levelFromScore(correct: number): MasteryLevel {
  if (correct >= 2) return 'strong';
  if (correct === 1) return 'medium';
  return 'weak';
}

/** В тренажёре уровень растёт по серии верных ответов */
export function levelFromPractice(tp: TopicProgress): MasteryLevel {
  if (tp.streak >= 6) return 'strong';
  if (tp.streak >= 3) return 'medium';
  if (tp.solved === 0 && tp.failed === 0) return tp.level;
  if (tp.level === 'unknown') return tp.failed > 0 ? 'weak' : 'medium';
  // не опускаем ниже результата диагностики, но поднимаем
  return tp.level === 'weak' ? 'weak' : tp.level;
}

export function recordMistake(tp: TopicProgress, feedback: string): TopicProgress {
  const key = feedback.slice(0, 60);
  const seen = tp.mistakesSeen.some((m) => m.slice(0, 60) === key);
  return {
    ...tp,
    mistakesSeen: seen ? tp.mistakesSeen : [...tp.mistakesSeen, feedback].slice(-5),
  };
}

// ---------- Реплики Джарвиса ----------

export const JARVIS = {
  welcome: (name: string) =>
    `Системы в норме, ${name}. Я — Джарвис, твой личный репетитор по математике. Сначала проведу полное сканирование: проверю все темы 5 класса и найду, где броня даёт трещины. Потом залатаем каждую.`,
  scanStart:
    'Запускаю диагностику. Перед тобой задания по всем разделам программы 5 класса. Не бойся ошибаться — мне важно увидеть, как ты думаешь. Если не знаешь — попробуй предположить.',
  scanResult: (weak: number, medium: number, strong: number) =>
    `Сканирование завершено. Прочная броня: ${strong} ${plural(strong, 'тема', 'темы', 'тем')}. Незакрытые участки: ${medium + weak}. ${weak > 0 ? `Критические уязвимости: ${weak} — начнём ремонт с них.` : 'Критических уязвимостей нет — отличная работа!'}`,
  correct: [
    'Верно! Системы работают идеально.',
    'Точное попадание. Так держать!',
    'Правильно. Броня в этом секторе крепка.',
    'Отлично! Записываю в актив.',
    'Верно! Ты делаешь успехи.',
  ],
  wrong: [
    'Мимо. Но я вижу, где произошёл сбой — сейчас разберём.',
    'Не сошлось. Анализирую ошибку...',
    'Неверно, но это полезные данные. Смотри, в чём дело.',
    'Стоп, здесь сбой в программе. Сейчас исправим вместе.',
  ],
  wrongGeneric:
    'Пока не могу точно определить тип ошибки. Сверься с решением ниже и найди, где твой путь разошёлся с правильным.',
  streak: (n: number) =>
    `Серия: ${n} верных подряд. ${n >= 6 ? 'Сектор полностью восстановлен — уровень «отлично»!' : n >= 3 ? 'Сектор стабилизируется. Ещё немного!' : 'Продолжаем!'}`,
};

export function plural(n: number, one: string, few: string, many: string): string {
  const m = n % 10, h = n % 100;
  if (m === 1 && h !== 11) return one;
  if (m >= 2 && m <= 4 && (h < 10 || h >= 20)) return few;
  return many;
}

export function pickOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
