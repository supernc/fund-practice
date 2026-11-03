import { ExamRecord, Question } from '../types';
import { saveExamRecord } from './storage';
import { getExamQuestions } from './questionService';

// 生成一份模拟试卷（subject=1 科目一 / 3 科目三 / 0 全部混合）
export function generateExam(subject: 0 | 1 | 3 = 1): Question[] {
  return getExamQuestions(subject);
}

// 合格线：基金从业资格考试每科 60 分及格
export const PASS_LINE = 60;

// 计算考试得分
export function calculateScore(
  questions: Question[],
  answers: Record<string, string[]>
): {
  score: number;
  correctCount: number;
  chapterScores: Record<number, { correct: number; total: number }>;
} {
  const totalQuestions = questions.length;
  const pointPerQuestion = 100 / totalQuestions; // 约 1.67 分/题

  let correctCount = 0;
  let totalScore = 0;
  const chapterScores: Record<number, { correct: number; total: number }> = {};

  for (const q of questions) {
    if (!chapterScores[q.chapter]) {
      chapterScores[q.chapter] = { correct: 0, total: 0 };
    }
    chapterScores[q.chapter].total += 1;

    const userAnswer = answers[q.id] || [];
    const correctAnswer = q.answer;

    if (isAnswerCorrect(userAnswer, correctAnswer, q.type)) {
      correctCount += 1;
      totalScore += pointPerQuestion;
      chapterScores[q.chapter].correct += 1;
    } else if (q.type === 'multiple') {
      // 多选题半对得部分分：选了部分正确选项且没选错的
      const partialScore = getPartialScore(userAnswer, correctAnswer, pointPerQuestion);
      totalScore += partialScore;
    }
  }

  return {
    score: Math.round(totalScore * 10) / 10,
    correctCount,
    chapterScores,
  };
}

// 判断答案是否完全正确
export function isAnswerCorrect(
  userAnswer: string[],
  correctAnswer: string[],
  type: 'single' | 'multiple'
): boolean {
  if (type === 'single') {
    return userAnswer.length === 1 && userAnswer[0] === correctAnswer[0];
  }
  // 多选题：完全一致才算对
  if (userAnswer.length !== correctAnswer.length) return false;
  const sortedUser = [...userAnswer].sort();
  const sortedCorrect = [...correctAnswer].sort();
  return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
}

// 多选题部分得分计算
function getPartialScore(
  userAnswer: string[],
  correctAnswer: string[],
  fullPoints: number
): number {
  if (userAnswer.length === 0) return 0;

  const correctSet = new Set(correctAnswer);
  const hasWrong = userAnswer.some(a => !correctSet.has(a));
  if (hasWrong) return 0; // 选了错误选项，0分

  // 选了部分正确选项，给半分
  const correctSelected = userAnswer.filter(a => correctSet.has(a)).length;
  if (correctSelected > 0 && correctSelected < correctAnswer.length) {
    return fullPoints * 0.5;
  }

  return 0;
}

// 提交考试并保存记录
export function submitExam(
  questions: Question[],
  answers: Record<string, string[]>,
  startTime: number,
  subject: 0 | 1 | 3 = 1
): ExamRecord {
  const endTime = Date.now();
  const { score, correctCount, chapterScores } = calculateScore(questions, answers);

  const record: ExamRecord = {
    id: `exam-${Date.now()}`,
    startTime,
    endTime,
    score,
    passed: score >= PASS_LINE,
    totalQuestions: questions.length,
    correctCount,
    answers,
    chapterScores,
    subject,
  };

  saveExamRecord(record);
  return record;
}

const examService = {
  generateExam,
  calculateScore,
  isAnswerCorrect,
  submitExam,
};

export default examService;
