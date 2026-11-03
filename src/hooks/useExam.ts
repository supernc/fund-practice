import { useState, useCallback, useEffect, useRef } from 'react';
import { Question, ExamRecord, ExamState } from '../types';
import { generateExam, submitExam, isAnswerCorrect } from '../services/examService';
import { addWrongQuestion, removeWrongQuestion, recordDailyAnswer, saveAnswerRecord } from '../services/storage';
import manifest from '../data/bank-manifest.json';

// 避免题库更新后恢复旧版本试卷中已经退出使用的题目。
const EXAM_STATE_KEY = `fund-exam-state:${manifest.version}`;
const EXAM_TIME = 120 * 60; // 120分钟模拟考试

export default function useExam() {
  // 记录本次考试的科目，用于交卷时标记（1 科目一 / 3 科目三 / 0 混合）
  const subjectRef = useRef<0 | 1 | 3>(1);
  const [state, setState] = useState<ExamState>({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    answers: {},
    markedQuestions: new Set(),
    startTime: null,
    remainingTime: EXAM_TIME,
  });

  const [examResult, setExamResult] = useState<ExamRecord | null>(null);

  // 尝试恢复考试状态
  useEffect(() => {
    const saved = sessionStorage.getItem(EXAM_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      subjectRef.current = parsed.subject === 0 || parsed.subject === 3 ? parsed.subject : 1;
      // 恢复 Set 类型
      parsed.markedQuestions = new Set(parsed.markedQuestions || []);
      // 计算剩余时间
      if (parsed.startTime) {
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        parsed.remainingTime = Math.max(EXAM_TIME - elapsed, 0);
      }
      setState(parsed);
    }
  }, []);

  // 保存考试状态到 sessionStorage
  const saveState = useCallback((newState: ExamState) => {
    const toSave = {
      ...newState,
      subject: subjectRef.current,
      markedQuestions: Array.from(newState.markedQuestions),
    };
    sessionStorage.setItem(EXAM_STATE_KEY, JSON.stringify(toSave));
  }, []);

  // 开始考试
  const startExam = useCallback((subject: 0 | 1 | 3 = 1) => {
    subjectRef.current = subject;
    const questions = generateExam(subject);
    const newState: ExamState = {
      status: 'ongoing',
      questions,
      currentIndex: 0,
      answers: {},
      markedQuestions: new Set(),
      startTime: Date.now(),
      remainingTime: EXAM_TIME,
    };
    setState(newState);
    saveState(newState);
    setExamResult(null);
  }, [saveState]);

  // 作答
  const answerQuestion = useCallback((questionId: string, answer: string[]) => {
    setState(prev => {
      const newState = {
        ...prev,
        answers: { ...prev.answers, [questionId]: answer },
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 标记题目
  const toggleMark = useCallback(() => {
    setState(prev => {
      const newMarked = new Set(prev.markedQuestions);
      if (newMarked.has(prev.currentIndex)) {
        newMarked.delete(prev.currentIndex);
      } else {
        newMarked.add(prev.currentIndex);
      }
      const newState = { ...prev, markedQuestions: newMarked };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 导航
  const goToQuestion = useCallback((index: number) => {
    setState(prev => {
      const newState = { ...prev, currentIndex: index };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const goNext = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex >= prev.questions.length - 1) return prev;
      const newState = { ...prev, currentIndex: prev.currentIndex + 1 };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const goPrev = useCallback(() => {
    setState(prev => {
      if (prev.currentIndex <= 0) return prev;
      const newState = { ...prev, currentIndex: prev.currentIndex - 1 };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // 交卷
  const submitExamAction = useCallback(() => {
    if (!state.startTime) return;

    const record = submitExam(state.questions, state.answers, state.startTime, subjectRef.current);
    setExamResult(record);

    // 记录每题的结果
    state.questions.forEach(q => {
      const userAns = state.answers[q.id] || [];
      const correct = isAnswerCorrect(userAns, q.answer, q.type);

      saveAnswerRecord({
        questionId: q.id,
        userAnswer: userAns,
        isCorrect: correct,
        timestamp: Date.now(),
        mode: 'exam',
      });

      recordDailyAnswer(correct);

      if (correct) {
        removeWrongQuestion(q.id);
      } else {
        addWrongQuestion(q.id);
      }
    });

    setState(prev => ({ ...prev, status: 'submitted' }));
    sessionStorage.removeItem(EXAM_STATE_KEY);
  }, [state]);

  // 重新考试（沿用上一次的科目）
  const retryExam = useCallback(() => {
    startExam(subjectRef.current);
  }, [startExam]);

  // 当前题目
  const currentQuestion = state.questions[state.currentIndex];
  const answeredCount = Object.keys(state.answers).filter(
    id => state.answers[id] && state.answers[id].length > 0
  ).length;

  return {
    state,
    examResult,
    currentQuestion,
    answeredCount,
    startExam,
    answerQuestion,
    toggleMark,
    goToQuestion,
    goNext,
    goPrev,
    submitExam: submitExamAction,
    retryExam,
  };
}
