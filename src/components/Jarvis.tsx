import type { ReactNode } from 'react';

/** Дуговой реактор — лицо Джарвиса */
export function Reactor({ size = 44 }: { size?: number }) {
  return (
    <div
      className="reactor relative shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle, hsl(187 92% 75%) 0%, hsl(187 92% 55%) 35%, hsl(200 90% 30%) 70%, hsl(220 47% 10%) 100%)',
        border: '2px solid hsl(187 92% 55% / 0.7)',
      }}
      aria-hidden
    >
      <div
        className="absolute rounded-full"
        style={{
          inset: '22%',
          border: '1.5px solid hsl(0 0% 100% / 0.55)',
          background: 'radial-gradient(circle, hsl(0 0% 100% / 0.9) 0%, hsl(187 92% 65% / 0.6) 60%, transparent 100%)',
        }}
      />
    </div>
  );
}

/** Реплика Джарвиса — пузырь диалога */
export function JarvisBubble({ children }: { children: ReactNode }) {
  return (
    <div className="hud-panel fade-up flex gap-4 p-4 sm:p-5" style={{ borderColor: 'hsl(187 92% 55% / 0.35)' }}>
      <Reactor size={40} />
      <div className="min-w-0">
        <div className="hud-label mb-1.5">Джарвис</div>
        <div className="text-[15px] leading-relaxed" style={{ color: 'hsl(var(--text))' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
