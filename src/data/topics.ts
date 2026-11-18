import type { Topic } from '../lib/types';
import { topicsPart1 } from './topics-part1';
import { topicsPart2 } from './topics-part2';
import { topicsPart3 } from './topics-part3';

export const TOPICS: Topic[] = [...topicsPart1, ...topicsPart2, ...topicsPart3];

export const topicById = (id: string): Topic =>
  TOPICS.find((t) => t.id === id) ?? TOPICS[0];
