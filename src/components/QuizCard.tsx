import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, ListChecks, ArrowRight } from 'lucide-react';
import type { Task } from '../lib/types';
import { normalizeAnswer, parseNum, answersEqual } from '../lib/math-utils';
import { JARVIS, pickOf } from '../lib/engine';

export interface QuizResult {
  correct: boolean;
  mistakeFeedback: string | null;
}

interface Props {
  task: Task;
  /** вызывается после проверки ответа */
  onResult: (r: QuizResult) => void;
  /** подпись кнопки продолжения */
  nextLabel?: string;
  onNext: () => void;
}

export function QuizCard({ task, onResult, onNext, nextLabel = 'Следующее задание' }: Props) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'answering' | 'checked'>('answering');
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // сброс при смене задания
  useEffect(() => {
    setInput('');
    setPhase('answering');
    setCorrect(false);
    setFeedback(null);
    setShowHint(false);
    inputRef.current?.focus();
  }, [task]);

  const check = () => {
    const norm = normalizeAnswer(input);
    if (!norm) return;
    const ok = answersEqual(norm, task.answer, task.alsoAccept ?? []);
    let fb: string | null = null;
    if (!ok && task.mistakes) {
      const num = parseNum(norm);
      const hit = task.mistakes.find((m) => {
        try {
          return m.test(norm, num);
        } catch {
          return false;
        }
      });
      fb = hit ? hit.feedback : null;
    }
    setCorrect(ok);
    setFeedback(fb);
    setPhase('checked');
    onResult({ correct: ok, mistakeFeedback: fb });
  };

  return (
    <div className="hud-panel fade-up p-5 sm:p-7">
      {/* Задание */}
      <div className="hud-label mb-3">Задание</div>
      <div
        className="font-hud whitespace-pre-line text-lg sm:text-xl leading-relaxed"
        style={{ color: 'hsl(var(--text))' }}
      >
        {task.prompt}
      </div>

      {/* Ввод ответа */}
      {phase === 'answering' && (
        <div className="mt-6 fade-up">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              className="hud-input"
              placeholder="Твой ответ…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              inputMode="text"
              autoComplete="off"
              aria-label="Поле для ответа"
            />
            <button className="btn-primary shrink-0" onClick={check} disabled={!normalizeAnswer(input)}>
              Проверить
            </button>
          </div>
          {task.hint && (
            <div className="mt-3">
              {showHint ? (
                <div
                  className="fade-up rounded-lg px-4 py-3 text-sm"
                  style={{ background: 'hsl(38 95% 55% / 0.1)', border: '1px solid hsl(38 95% 55% / 0.35)', color: 'hsl(38 95% 70%)' }}
                >
                  <Lightbulb size={15} className="inline mr-2 -mt-0.5" />
                  {task.hint}
                </div>
              ) : (
                <button
                  className="text-sm font-semibold cursor-pointer transition-colors duration-200 inline-flex items-center gap-1.5"
                  style={{ color: 'hsl(var(--text-dim))' }}
                  onClick={() => setShowHint(true)}
                >
                  <Lightbulb size={15} style={{ color: 'hsl(38 95% 55%)' }} />
                  Нужна подсказка
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Результат проверки */}
      {phase === 'checked' && (
        <div className="mt-6 space-y-4">
          <div
            className="fade-up rounded-lg px-4 py-3.5 flex gap-3"
            style={{
              background: correct ? 'hsl(152 70% 45% / 0.1)' : 'hsl(4 85% 60% / 0.08)',
              border: `1px solid ${correct ? 'hsl(152 70% 45% / 0.4)' : 'hsl(4 85% 60% / 0.4)'}`,
            }}
          >
            {correct ? (
              <CheckCircle2 size={22} className="shrink-0 mt-0.5" style={{ color: 'hsl(152 70% 50%)' }} />
            ) : (
              <XCircle size={22} className="shrink-0 mt-0.5" style={{ color: 'hsl(4 85% 65%)' }} />
            )}
            <div>
              <div className="font-bold" style={{ color: correct ? 'hsl(152 70% 60%)' : 'hsl(4 85% 70%)' }}>
                {correct ? pickOf(JARVIS.correct) : pickOf(JARVIS.wrong)}
              </div>
              {!correct && (
                <div className="mt-1.5 text-[15px] leading-relaxed" style={{ color: 'hsl(var(--text))' }}>
                  {feedback ?? JARVIS.wrongGeneric}
                </div>
              )}
            </div>
          </div>

          {/* Разбор решения */}
          {!correct && (
            <div className="fade-up hud-panel p-4" style={{ borderColor: 'hsl(187 92% 55% / 0.25)' }}>
              <div className="hud-label mb-2 flex items-center gap-1.5">
                <ListChecks size={13} /> Разбор решения
              </div>
              <ol className="space-y-1.5 text-[15px]" style={{ color: 'hsl(var(--text-dim))' }}>
                {task.solution.map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="font-hud shrink-0" style={{ color: 'hsl(var(--cyan))' }}>{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button className="btn-primary" onClick={onNext}>
            {nextLabel} <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
