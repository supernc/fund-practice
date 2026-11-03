import type { Question } from '../types';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 同一题库同时用于学习和模考；试卷内避免基础问答被引用后又单独出现。
export function sampleExam(pool: Question[], count = 100): Question[] {
  const target = Math.min(count, pool.length);
  const standalone = pool.filter(q => q.trainingKind !== 'composite');
  const composites = shuffle(pool.filter(q => q.trainingKind === 'composite'));
  const standaloneIds = new Set(standalone.map(q => q.id));
  const selected: Question[] = [];
  const usedConcepts = new Set<string>();
  for (const q of composites) {
    if (selected.length >= Math.min(25, Math.floor(target / 4))) break;
    const ids = q.components?.map(c => c.seedId) || [];
    if (ids.length !== 4 || ids.some(id => usedConcepts.has(id))) continue;
    const nextUsed = new Set([...usedConcepts, ...ids]);
    const available = [...standaloneIds].filter(id => !nextUsed.has(id)).length;
    if (available < target - selected.length - 1) continue;
    selected.push(q);
    for (const id of ids) usedConcepts.add(id);
  }
  selected.push(...shuffle(standalone.filter(q => !usedConcepts.has(q.id))).slice(0, target - selected.length));
  // 删除大量题目后可用普通题不足时，优先保证仍能使用全部剩余题；不重复题号。
  if (selected.length < target) {
    const ids = new Set(selected.map(q => q.id));
    selected.push(...shuffle(pool.filter(q => !ids.has(q.id))).slice(0, target - selected.length));
  }
  return shuffle(selected);
}
