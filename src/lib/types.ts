// Типы данных репетитора «Джарвис»

export type AnswerInput = string;

/** Один сгенерированный вопрос/задание */
export interface Task {
  /** Текст задания (может содержать переносы \n) */
  prompt: string;
  /** Правильный ответ в нормализованном виде (например "12,5" или "3/4") */
  answer: string;
  /** Допустимые альтернативные записи ответа */
  alsoAccept?: string[];
  /** Пошаговое решение — показываем после ответа */
  solution: string[];
  /** Детекторы типичных ошибок: если ответ совпал — показываем разбор */
  mistakes?: Mistake[];
  /** Подсказка, если ученик просит помощь */
  hint?: string;
}

export interface Mistake {
  /** Проверяет нормализованный ответ ученика */
  test: (input: string, num: number | null) => boolean;
  /** Разбор: в чём ошибка и как правильно */
  feedback: string;
}

export interface TheoryBlock {
  kind: 'text' | 'rule' | 'example' | 'tip';
  title?: string;
  body: string;
}

export interface Topic {
  id: string;
  /** Короткое название для карты */
  title: string;
  /** Название для Джарвиса-сканера */
  scanName: string;
  icon: string;
  /** Объяснение простым языком */
  theory: TheoryBlock[];
  /** Генератор заданий. difficulty 1..3 */
  generate: (difficulty: number) => Task;
}

export type MasteryLevel = 'unknown' | 'weak' | 'medium' | 'strong';

export interface TopicProgress {
  level: MasteryLevel;
  /** сколько заданий решено верно подряд в тренажёре */
  streak: number;
  solved: number;
  failed: number;
  /** частые ошибки (тексты feedback), которые встречались */
  mistakesSeen: string[];
}

export interface Profile {
  name: string;
  createdAt: number;
  diagnosticDone: boolean;
  topics: Record<string, TopicProgress>;
}
