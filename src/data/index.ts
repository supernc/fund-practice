import { Question } from '../types';
import { getDeletedQuestions } from '../services/storage';
import chapter1Data from './questions/chapter1.json';
import chapter3Data from './questions/chapter3.json';

// 合并所有题库：科目一 + 科目三
const rawQuestions: Question[] = [
  ...(chapter1Data as Question[]),
  ...(chapter3Data as Question[]),
];

// 获取全部题目（已排除用户删除的题目）
export function getAllQuestions(): Question[] {
  const deleted = getDeletedQuestions();
  if (deleted.size === 0) return rawQuestions;
  return rawQuestions.filter(q => !deleted.has(q.id));
}

// 获取包括已删除在内的全部题目（仅用于「已删除题目」恢复管理）
export function getRawQuestions(): Question[] {
  return rawQuestions;
}

// 按章节（科目）获取题目
export function getQuestionsByChapter(chapter: number): Question[] {
  return getAllQuestions().filter(q => q.chapter === chapter);
}

// 按子章节（教材章节）获取题目
export function getQuestionsBySubChapter(subChapter: string): Question[] {
  return getAllQuestions().filter(q => q.subChapter === subChapter);
}

// 按 ID 获取单题
export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find(q => q.id === id);
}

// 仅获取计算题（科目三为主，用于「计算题专练」）
export function getCalcQuestions(): Question[] {
  return getAllQuestions().filter(q => q.tags.includes('计算题'));
}
