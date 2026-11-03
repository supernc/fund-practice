// 选项结构
export interface Option {
  label: string;  // A, B, C, D
  text: string;   // 选项内容
}

// 题目结构
export interface Question {
  id: string;                    // 唯一标识，如 "ch2-cvm-003"
  stem: string;                  // 题干文本
  options: Option[];             // 选项数组
  answer: string[];              // 正确答案，如 ["A"] 或 ["A","C"]
  type: "single" | "multiple";   // 题型
  chapter: number;               // 所属章节 1-5
  subChapter: string;            // 子章节标识
  tags: string[];                // 知识点标签
  analysis: string;              // 解析文本
  wikiUrl?: string;              // 对应 Wiki 页面链接
  difficulty: 1 | 2 | 3;        // 难度等级
}

// 考试记录
export interface ExamRecord {
  id: string;
  startTime: number;
  endTime: number;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctCount: number;
  answers: Record<string, string[]>;  // questionId -> 用户选择
  chapterScores: Record<number, { correct: number; total: number }>;
  subject?: 0 | 1 | 3;                // 考试科目：1 科目一 / 3 科目三 / 0 混合
}

// 答题记录（单题）
export interface AnswerRecord {
  questionId: string;
  userAnswer: string[];
  isCorrect: boolean;
  timestamp: number;
  mode: 'exam' | 'practice' | 'random';
}

// 章节信息
export interface ChapterInfo {
  id: number;
  name: string;
  description: string;
  weight: number;  // 考试占比百分比
  subChapters: SubChapter[];
  wikiUrl: string;
}

// 子章节信息
export interface SubChapter {
  id: string;
  name: string;
  wikiUrl: string;
}

// 用户进度
export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  chapterProgress: Record<number, {
    answered: number;
    correct: number;
    total: number;
  }>;
  dailyStats: Record<string, {
    answered: number;
    correct: number;
  }>;
  examHistory: ExamRecord[];
  wrongQuestions: Set<string>;  // questionId set
  favorites: Set<string>;       // questionId set
  lastStudyDate: string;
  streakDays: number;
}

// 考试状态
export type ExamStatus = 'idle' | 'preparing' | 'ongoing' | 'submitted';

// 考试状态机
export interface ExamState {
  status: ExamStatus;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string[]>;
  markedQuestions: Set<number>;
  startTime: number | null;
  remainingTime: number;  // 秒
}

// 练习状态
export interface PracticeState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string[]>;
  showAnalysis: boolean;
  isSubmitted: boolean;
  stats: {
    answered: number;
    correct: number;
  };
}

// 存储数据结构
export interface StorageData {
  answerRecords: AnswerRecord[];
  wrongQuestions: string[];     // questionId array (JSON不支持Set)
  favorites: string[];          // questionId array
  examHistory: ExamRecord[];
  dailyStats: Record<string, { answered: number; correct: number }>;
  lastStudyDate: string;
  streakDays: number;
  version: number;
}

// 统计数据
export interface StatsData {
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number;
  chapterStats: Record<number, {
    name: string;
    answered: number;
    correct: number;
    rate: number;
    total: number;
  }>;
  examHistory: ExamRecord[];
  bestScore: number;
  avgScore: number;
  dailyStats: Record<string, { answered: number; correct: number }>;
  streakDays: number;
  weakPoints: { chapter: number; subChapter: string; name: string; rate: number }[];
}
