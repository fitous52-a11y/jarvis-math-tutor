import { useState } from 'react';
import { ArrowLeft, BookOpen, Dumbbell, Flame } from 'lucide-react';
import type { Profile, Task, TheoryBlock, TopicProgress } from '../lib/types';
import { topicById } from '../data/topics';
import { LEVEL_META } from '../lib/levels';
import { JARVIS } from '../lib/engine';
import { JarvisBubble } from '../components/Jarvis';
import { QuizCard, type QuizResult } from '../components/QuizCard';
import { TopicIcon } from '../components/TopicCard';

interface Props {
  topicId: string;
  profile: Profile;
  onPractice: (topicId: string, result: QuizResult) => TopicProgress;
  onBack: () => void;
}

const BLOCK_STYLE: Record<TheoryBlock['kind'], { border: string; label: string | null; color: string }> = {
  text: { border: 'hsl(210 30% 20%)', label: null, color: 'hsl(var(--text))' },
  rule: { border: 'hsl(187 92% 55% / 0.45)', label: 'Правило', color: 'hsl(var(--cyan))' },
  example: { border: 'hsl(38 95% 55% / 0.4)', label: 'Пример', color: 'hsl(38 95% 62%)' },
  tip: { border: 'hsl(152 70% 45% / 0.4)', label: 'Совет Джарвиса', color: 'hsl(152 70% 55%)' },
};

export default function TopicScreen({ topicId, profile, onPractice, onBack }: Props) {
  const topic = topicById(topicId);
  const progress = profile.topics[topicId];
  const meta = LEVEL_META[progress.level];
  const [tab, setTab] = useState<'learn' | 'train'>(progress.level === 'weak' ? 'learn' : 'train');
  const [task, setTask] = useState<Task>(() => topic.generate(1));
  const [taskKey, setTaskKey] = useState(0);
  const [jarvisNote, setJarvisNote] = useState<string | null>(null);

  const difficulty = progress.streak >= 4 ? 2 : 1;

  const handleResult = (r: QuizResult) => {
    const updated = onPractice(topicId, r);
    if (r.correct && (updated.streak === 3 || updated.streak === 6)) {
      setJarvisNote(JARVIS.streak(updated.streak));
    } else {
      setJarvisNote(null);
    }
  };

  const handleNext = () => {
    setTask(topic.generate(difficulty));
    setTaskKey((k) => k + 1);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={onBack}>
        <ArrowLeft size={14} /> К карте тем
      </button>

      {/* Заголовок темы */}
      <div className="mt-5 flex items-center gap-4">
        <div className="rounded-xl p-3" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
          <TopicIcon icon={topic.icon} size={26} color={meta.color} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'hsl(var(--text))' }}>{topic.title}</h1>
          <div className="text-sm font-semibold" style={{ color: meta.color }}>{meta.label}</div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl p-1.5" style={{ background: 'hsl(var(--panel))' }}>
        {([
          { id: 'learn', label: 'Разобраться', icon: BookOpen },
          { id: 'train', label: 'Тренировка', icon: Dumbbell },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-bold text-sm transition-all duration-200 cursor-pointer"
            style={
              tab === id
                ? { background: 'hsl(var(--cyan))', color: 'hsl(222 47% 8%)', boxShadow: '0 0 16px hsl(187 92% 55% / 0.4)' }
                : { color: 'hsl(var(--text-dim))' }
            }
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Теория */}
      {tab === 'learn' && (
        <div className="mt-6 space-y-4">
          <JarvisBubble>
            Сектор «{topic.scanName}». Вот всё, что нужно знать, — простыми словами. Прочитай,
            потом переходи в тренировку: там я буду давать задания и разбирать ошибки.
          </JarvisBubble>
          {topic.theory.map((block, i) => {
            const st = BLOCK_STYLE[block.kind];
            return (
              <div key={i} className="hud-panel fade-up p-5" style={{ borderColor: st.border }}>
                {(block.title ?? st.label) && (
                  <div className="hud-label mb-2" style={{ color: st.color }}>
                    {block.title ?? st.label}
                  </div>
                )}
                <div className="whitespace-pre-line text-[15px] leading-relaxed" style={{ color: 'hsl(var(--text))' }}>
                  {block.body}
                </div>
              </div>
            );
          })}
          <button className="btn-primary w-full" onClick={() => setTab('train')}>
            <Dumbbell size={17} /> Понятно! К тренировке
          </button>
        </div>
      )}

      {/* Тренажёр */}
      {tab === 'train' && (
        <div className="mt-6 space-y-5">
          {/* Статус */}
          <div className="flex items-center justify-between font-hud text-xs" style={{ color: 'hsl(var(--text-dim))' }}>
            <span>решено {progress.solved} · ошибок {progress.failed}</span>
            <span className="flex items-center gap-1.5" style={{ color: progress.streak > 0 ? 'hsl(38 95% 60%)' : undefined }}>
              <Flame size={13} /> серия: {progress.streak}
              {progress.streak >= 6 ? ' — сектор восстановлен' : progress.streak >= 3 ? ' — сектор стабилизируется' : ''}
            </span>
          </div>
          {/* Полоса до следующего уровня */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--panel-2))' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(progress.streak / 6, 1) * 100}%`,
                background: 'linear-gradient(90deg, hsl(38 95% 55%), hsl(187 92% 55%))',
              }}
            />
          </div>

          {jarvisNote && <JarvisBubble>{jarvisNote}</JarvisBubble>}

          <div key={taskKey}>
            <QuizCard task={task} onResult={handleResult} onNext={handleNext} nextLabel="Ещё задание" />
          </div>

          {progress.mistakesSeen.length > 0 && (
            <div className="hud-panel p-4" style={{ borderColor: 'hsl(38 95% 55% / 0.3)' }}>
              <div className="hud-label mb-2" style={{ color: 'hsl(38 95% 62%)' }}>
                Твои типичные ошибки в этой теме
              </div>
              <ul className="space-y-2 text-sm" style={{ color: 'hsl(var(--text-dim))' }}>
                {progress.mistakesSeen.slice(-3).map((m, i) => (
                  <li key={i} className="leading-relaxed">— {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
