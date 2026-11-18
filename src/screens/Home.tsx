import { Radar, RotateCcw, Map, Zap } from 'lucide-react';
import type { Profile } from '../lib/types';
import { TOPICS } from '../data/topics';
import { JARVIS, plural } from '../lib/engine';
import { LEVEL_META } from '../lib/levels';
import { JarvisBubble, Reactor } from '../components/Jarvis';
import { TopicCard } from '../components/TopicCard';

interface Props {
  profile: Profile;
  onStartDiagnostic: () => void;
  onOpenTopic: (id: string) => void;
  onReset: () => void;
}

export default function Home({ profile, onStartDiagnostic, onOpenTopic, onReset }: Props) {
  const counts = { weak: 0, medium: 0, strong: 0 };
  if (profile.diagnosticDone) {
    for (const t of TOPICS) {
      const lvl = profile.topics[t.id]?.level ?? 'unknown';
      if (lvl !== 'unknown') counts[lvl]++;
    }
  }
  const firstWeak = TOPICS.find((t) => profile.topics[t.id]?.level === 'weak')
    ?? TOPICS.find((t) => profile.topics[t.id]?.level === 'medium');

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
      {/* Шапка */}
      <header className="flex items-center gap-4">
        <Reactor size={56} />
        <div>
          <h1 className="font-hud text-2xl sm:text-3xl font-bold tracking-widest glow-cyan" style={{ color: 'hsl(var(--cyan))' }}>
            ДЖАРВИС
          </h1>
          <div className="hud-label mt-1">репетитор по математике · 5 класс</div>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        <JarvisBubble>
          {profile.diagnosticDone
            ? JARVIS.scanResult(counts.weak, counts.medium, counts.strong)
            : JARVIS.welcome(profile.name)}
        </JarvisBubble>

        {!profile.diagnosticDone && (
          <div className="hud-panel fade-up p-6 sm:p-8 text-center">
            <Radar size={40} className="mx-auto" style={{ color: 'hsl(var(--cyan))' }} />
            <h2 className="mt-4 text-xl sm:text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>
              Диагностика по всей программе
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[15px]" style={{ color: 'hsl(var(--text-dim))' }}>
              {TOPICS.length} тем 5 класса, по 2 задания на каждую — всего {TOPICS.length * 2} заданий,
              примерно 15–20 минут. По итогам Джарвис построит карту знаний и найдёт слабые места.
            </p>
            <button className="btn-primary mt-6 text-lg px-8 py-3.5" onClick={onStartDiagnostic}>
              <Zap size={19} /> Начать сканирование
            </button>
          </div>
        )}

        {profile.diagnosticDone && (
          <>
            {/* Сводка */}
            <div className="grid grid-cols-3 gap-3">
              {(['weak', 'medium', 'strong'] as const).map((lvl) => (
                <div key={lvl} className="hud-panel p-3 sm:p-4 text-center" style={{ borderColor: LEVEL_META[lvl].border }}>
                  <div className="font-hud text-2xl sm:text-3xl font-bold" style={{ color: LEVEL_META[lvl].color }}>
                    {counts[lvl]}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-xs font-semibold leading-tight" style={{ color: 'hsl(var(--text-dim))' }}>
                    {lvl === 'weak'
                      ? plural(counts.weak, 'уязвимость', 'уязвимости', 'уязвимостей')
                      : lvl === 'medium'
                        ? plural(counts.medium, 'тема', 'темы', 'тем') + ' доработать'
                        : 'прочная броня'}
                  </div>
                </div>
              ))}
            </div>

            {firstWeak && (
              <button
                className="btn-primary w-full text-base sm:text-lg py-3.5"
                onClick={() => onOpenTopic(firstWeak.id)}
              >
                <Zap size={18} /> Продолжить ремонт: {firstWeak.title}
              </button>
            )}

            <div>
              <div className="hud-label mb-3 flex items-center gap-2">
                <Map size={13} /> Карта тем
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {TOPICS.map((t) => (
                  <TopicCard key={t.id} topic={t} progress={profile.topics[t.id]} onOpen={onOpenTopic} />
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button className="btn-ghost text-sm" onClick={onStartDiagnostic}>
                <Radar size={15} /> Пройти диагностику заново
              </button>
              <button className="btn-ghost text-sm" onClick={onReset}>
                <RotateCcw size={15} /> Сбросить прогресс
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
