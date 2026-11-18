import { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { TOPICS } from '../data/topics';
import type { Task } from '../lib/types';
import { JARVIS } from '../lib/engine';
import { JarvisBubble } from '../components/Jarvis';
import { QuizCard, type QuizResult } from '../components/QuizCard';
import { TopicIcon } from '../components/TopicCard';

interface QueueItem {
  topicId: string;
  task: Task;
}

interface Props {
  onFinish: (scores: Record<string, number>) => void;
  onAbort: () => void;
}

export default function Diagnostic({ onFinish, onAbort }: Props) {
  const queue = useMemo<QueueItem[]>(() => {
    const q: QueueItem[] = [];
    // перемешиваем порядок тем, чтобы задания шли вперемешку
    const topics = [...TOPICS].sort(() => Math.random() - 0.5);
    for (const t of topics) {
      q.push({ topicId: t.id, task: t.generate(1) });
      q.push({ topicId: t.id, task: t.generate(1) });
    }
    return q;
  }, []);

  const [index, setIndex] = useState(0);
  const scoresRef = useRef<Record<string, number>>({});
  const total = queue.length;
  const item = queue[index];
  const topic = TOPICS.find((t) => t.id === item.topicId)!;
  const done = Math.min(index, total);

  const handleResult = (r: QuizResult) => {
    if (!r.correct) return;
    scoresRef.current = {
      ...scoresRef.current,
      [item.topicId]: (scoresRef.current[item.topicId] ?? 0) + 1,
    };
  };

  const handleNext = () => {
    if (index + 1 >= total) {
      onFinish(scoresRef.current);
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:pt-10">
      <div className="flex items-center justify-between gap-4">
        <div className="hud-label">Диагностика систем</div>
        <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={onAbort} aria-label="Прервать диагностику">
          <X size={14} /> Прервать
        </button>
      </div>

      {/* Прогресс */}
      <div className="mt-4">
        <div className="flex justify-between font-hud text-xs" style={{ color: 'hsl(var(--text-dim))' }}>
          <span className="flex items-center gap-1.5">
            <TopicIcon icon={topic.icon} size={13} color="hsl(var(--cyan))" />
            {topic.scanName}
          </span>
          <span>{done + 1} / {total}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--panel-2))' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${(done / total) * 100}%`,
              background: 'linear-gradient(90deg, hsl(200 90% 45%), hsl(187 92% 55%))',
              boxShadow: '0 0 12px hsl(187 92% 55% / 0.7)',
            }}
          />
        </div>
      </div>

      {index === 0 && (
        <div className="mt-5">
          <JarvisBubble>{JARVIS.scanStart}</JarvisBubble>
        </div>
      )}

      <div className="mt-6" key={index}>
        <QuizCard
          task={item.task}
          onResult={handleResult}
          onNext={handleNext}
          nextLabel={index + 1 >= total ? 'Завершить сканирование' : 'Дальше'}
        />
      </div>
    </div>
  );
}
