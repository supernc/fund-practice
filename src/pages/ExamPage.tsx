import { useState } from 'react';
import useExam from '../hooks/useExam';
import QuestionCard from '../components/question/QuestionCard';
import QuestionNav from '../components/question/QuestionNav';
import ExamToolbar from '../components/exam/ExamToolbar';
import ExamResult from '../components/exam/ExamResult';
import Button from '../components/common/Button';
import { ConfirmModal } from '../components/common/Modal';
import { FileText, Clock, Target, AlertTriangle } from 'lucide-react';
import { toggleFavorite, getFavorites } from '../services/storage';

export default function ExamPage() {
  const {
    state, examResult, currentQuestion, answeredCount,
    startExam, answerQuestion, toggleMark, goToQuestion, goNext, goPrev,
    submitExam, retryExam,
  } = useExam();

  const [showConfirm, setShowConfirm] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(getFavorites());
  const [subject, setSubject] = useState<0 | 1 | 3>(1);

  const handleToggleFavorite = (qId: string) => {
    toggleFavorite(qId);
    setFavorites(getFavorites());
  };

  const subjectOptions: { key: 0 | 1 | 3; name: string; full: string }[] = [
    { key: 1, name: '科目一', full: '基金基础知识与法律法规' },
    { key: 3, name: '科目三', full: '私募股权投资基金基础知识' },
    { key: 0, name: '两科混合', full: '跨科目综合练习' },
  ];

  // 考试前 - 须知页面
  if (state.status === 'idle' || state.status === 'preparing') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card-glow rounded-2xl bg-bg-secondary p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6">
            <FileText size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">基金从业 · 随机自测</h2>
          <p className="text-text-secondary mb-8">从原创模拟题中抽取 100 题，检验备考水平</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-card rounded-xl p-4">
              <FileText size={20} className="text-primary-light mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">100 题</div>
              <div className="text-xs text-text-secondary">全部为单选题</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4">
              <Clock size={20} className="text-primary-cyan mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">120 分钟</div>
              <div className="text-xs text-text-secondary">考试时长</div>
            </div>
            <div className="bg-bg-card rounded-xl p-4">
              <Target size={20} className="text-success mx-auto mb-2" />
              <div className="text-lg font-bold text-text-primary">60 分</div>
              <div className="text-xs text-text-secondary">及格线</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold text-text-primary mb-3 text-left">选择科目</div>
            <div className="grid grid-cols-3 gap-3">
              {subjectOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSubject(opt.key)}
                  className={`rounded-xl p-3 text-left transition-all cursor-pointer border ${
                    subject === opt.key
                      ? 'bg-primary/15 border-primary/40'
                      : 'bg-bg-card border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`text-sm font-bold ${subject === opt.key ? 'text-primary-light' : 'text-text-primary'}`}>
                    {opt.name}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-1 leading-snug">{opt.full}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-card rounded-xl p-4 mb-8 text-left">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              <span className="text-sm font-semibold text-warning">考试须知</span>
            </div>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 考试中不显示正确答案，交卷后统一批改</li>
              <li>• 可以标记不确定的题目，稍后回来检查</li>
              <li>• 全卷为单选题，每题 1 分，满分 100 分</li>
              <li>• 超时将自动交卷</li>
              <li>• 刷新页面不会丢失答题进度</li>
            </ul>
          </div>

          <Button variant="primary" size="lg" onClick={() => startExam(subject)} className="w-full">
            开始考试
          </Button>
        </div>
      </div>
    );
  }

  // 考试结束 - 结果页面
  if (state.status === 'submitted' && examResult) {
    return <ExamResult record={examResult} onRetry={retryExam} />;
  }

  // 考试进行中
  if (!currentQuestion) return null;

  const answeredMap: Record<number, boolean> = {};
  state.questions.forEach((q, i) => {
    answeredMap[i] = !!(state.answers[q.id] && state.answers[q.id].length > 0);
  });

  return (
    <div className="animate-fade-in">
      <ExamToolbar
        currentIndex={state.currentIndex}
        total={state.questions.length}
        answeredCount={answeredCount}
        remainingSeconds={state.remainingTime}
        isMarked={state.markedQuestions.has(state.currentIndex)}
        onPrev={goPrev}
        onNext={goNext}
        onMark={toggleMark}
        onSubmit={() => setShowConfirm(true)}
        onTimeUp={submitExam}
      />

      <div className="max-w-4xl mx-auto mt-6 grid grid-cols-[1fr_200px] gap-6">
        <QuestionCard
          question={currentQuestion}
          index={state.currentIndex}
          total={state.questions.length}
          userAnswer={state.answers[currentQuestion.id] || []}
          onAnswer={answerQuestion}
          showResult={false}
          isFavorited={favorites.has(currentQuestion.id)}
          onToggleFavorite={handleToggleFavorite}
          mode="exam"
        />

        <div className="card-glow rounded-xl bg-bg-secondary p-4 h-fit sticky top-40">
          <h4 className="text-xs font-semibold text-text-secondary mb-3 uppercase">答题卡</h4>
          <QuestionNav
            total={state.questions.length}
            currentIndex={state.currentIndex}
            answeredMap={answeredMap}
            markedSet={state.markedQuestions}
            onNavigate={goToQuestion}
            compact
          />
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/15" /> 已答</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-warning/20" /> 标记</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-bg-card" /> 未答</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); submitExam(); }}
        title="确认交卷"
        message={`你已完成 ${answeredCount}/${state.questions.length} 题。${answeredCount < state.questions.length ? `还有 ${state.questions.length - answeredCount} 题未作答。` : ''} 确定要交卷吗？`}
        confirmText="确认交卷"
        variant="primary"
      />
    </div>
  );
}
