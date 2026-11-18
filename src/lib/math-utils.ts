// Утилиты генерации и проверки

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

/** Нормализует ввод ученика: пробелы, запятые, русские буквы-опечатки */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
    .replace(/−/g, '-');
}

export function parseNum(norm: string): number | null {
  if (norm === '' ) return null;
  const fraction = norm.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) {
    const den = Number(fraction[2]);
    if (den === 0) return null;
    return Number(fraction[1]) / den;
  }
  const n = Number(norm);
  return Number.isFinite(n) ? n : null;
}

/** Формат числа по-русски: 3.75 -> "3,75" */
export function fmt(n: number): string {
  const rounded = Math.round(n * 10000) / 10000;
  return String(rounded).replace('.', ',');
}

/** "3/8" или сокращённая */
export function frac(n: number, d: number): string {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
}

export function answersEqual(inputNorm: string, correct: string, alsoAccept: string[] = []): boolean {
  const candidates = [correct, ...alsoAccept].map(normalizeAnswer);
  if (candidates.includes(inputNorm)) return true;
  const a = parseNum(inputNorm);
  if (a === null) return false;
  return candidates.some((c) => {
    const b = parseNum(c);
    return b !== null && Math.abs(a - b) < 1e-9;
  });
}
