import { useCallback, useState } from 'react';
import type { Profile, TopicProgress } from './lib/types';
import { loadProfile, saveProfile, resetProfile, levelFromScore, recordMistake } from './lib/engine';
import { TOPICS } from './data/topics';
import type { QuizResult } from './components/QuizCard';
import Home from './screens/Home';
import Diagnostic from './screens/Diagnostic';
import TopicScreen from './screens/TopicScreen';

type View = { kind: 'home' } | { kind: 'diagnostic' } | { kind: 'topic'; id: string };

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [view, setView] = useState<View>({ kind: 'home' });

  const update = useCallback((p: Profile) => {
    setProfile(p);
    saveProfile(p);
  }, []);

  const handleFinishDiagnostic = useCallback(
    (scores: Record<string, number>) => {
      const topics: Profile['topics'] = { ...profile.topics };
      for (const t of TOPICS) {
        const prev = topics[t.id];
        topics[t.id] = { ...prev, level: levelFromScore(scores[t.id] ?? 0) };
      }
      update({ ...profile, diagnosticDone: true, topics });
      setView({ kind: 'home' });
    },
    [profile, update],
  );

  const handlePractice = useCallback(
    (topicId: string, result: QuizResult): TopicProgress => {
      const tp: TopicProgress = { ...profile.topics[topicId] };
      if (result.correct) {
        tp.solved += 1;
        tp.streak += 1;
      } else {
        tp.failed += 1;
        tp.streak = 0;
        if (result.mistakeFeedback) {
          Object.assign(tp, recordMistake(tp, result.mistakeFeedback));
        }
      }
      if (tp.streak >= 6) tp.level = 'strong';
      else if (tp.streak >= 3 && tp.level !== 'strong') tp.level = 'medium';
      else if (tp.level === 'unknown' && tp.solved + tp.failed > 0)
        tp.level = tp.failed > tp.solved ? 'weak' : 'medium';

      update({ ...profile, topics: { ...profile.topics, [topicId]: tp } });
      return tp;
    },
    [profile, update],
  );

  const handleReset = useCallback(() => {
    if (window.confirm('Сбросить весь прогресс и начать с чистого листа?')) {
      update(resetProfile());
      setView({ kind: 'home' });
    }
  }, [update]);

  return (
    <div className="min-h-dvh">
      {view.kind === 'home' && (
        <Home
          profile={profile}
          onStartDiagnostic={() => setView({ kind: 'diagnostic' })}
          onOpenTopic={(id) => setView({ kind: 'topic', id })}
          onReset={handleReset}
        />
      )}
      {view.kind === 'diagnostic' && (
        <Diagnostic onFinish={handleFinishDiagnostic} onAbort={() => setView({ kind: 'home' })} />
      )}
      {view.kind === 'topic' && (
        <TopicScreen
          topicId={view.id}
          profile={profile}
          onPractice={handlePractice}
          onBack={() => setView({ kind: 'home' })}
        />
      )}
    </div>
  );
}
