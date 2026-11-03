import { useEffect, useState } from 'react';
import usePractice from '../hooks/usePractice';
import { getCalcQuestions } from '../data';
import QuestionCard from '../components/question/QuestionCard';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { ChevronLeft, ChevronRight, CheckCircle, Calculator, Sparkles } from 'lucide-react';

export default function PracticalPage() {
  const practice = usePractice('practice');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const qs = getCalcQuestions();
    setTotal(qs.length);
    practice.setQuestions(qs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (practice.userAnswer.length === 0) return;
    practice.submitAnswer();
    // 计算题答错时不要自动跳转，给用户时间看解析里的公式与口径
  };

  const handleNext = () => {
    if (practice.currentIndex < practice.questions.length - 1) {
      practice.goNext();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card-glow rounded-2xl bg-gradient-to-br from-primary/10 via-bg-secondary to-bg-secondary p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-cyan flex items-center justify-center flex-shrink-0">
            <Calculator size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
              计算题专练
              <Sparkles size={16} className="text-primary-light" />
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              聚焦基金从业考试中的计算型考点——收益率、久期与凸性、基金份额净值与估值、
              夏普比率与业绩评价指标、期权内在价值等。答错后查看解析，把公式与口径一次性吃透，
              这是科目三最容易失分的部分。
              <span className="text-text-muted ml-1">
                · 共 {total} 道
              </span>
            </p>
          </div>
        </div>
      </div>

      {!practice.currentQuestion ? (
        <div className="card-glow rounded-2xl bg-bg-secondary p-12 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-lg font-bold text-text-primary mb-2">题库加载中...</h3>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="card-glow rounded-xl bg-bg-secondary p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary">
                进度：{practice.stats.answered}/{practice.questions.length} 题
              </span>
              <span className="text-xs">
                正确率：
                <span
                  className={`font-bold ${
                    practice.stats.answered > 0 &&
                    practice.stats.correct / practice.stats.answered >= 0.6
                      ? 'text-success'
                      : 'text-warning'
                  }`}
                >
                  {practice.stats.answered > 0
                    ? Math.round(
                        (practice.stats.correct / practice.stats.answered) * 100
                      )
                    : 0}
                  %
                </span>
              </span>
            </div>
            <ProgressBar
              value={practice.stats.answered}
              max={practice.questions.length}
              color="primary"
              size="sm"
            />
          </div>

          {/* Question */}
          <QuestionCard
            question={practice.currentQuestion}
            index={practice.currentIndex}
            total={practice.questions.length}
            userAnswer={practice.userAnswer}
            onAnswer={(_, ans) => practice.answerQuestion(ans)}
            showResult={practice.isSubmitted}
            isFavorited={practice.favorites.has(practice.currentQuestion.id)}
            onToggleFavorite={practice.toggleFavorite}
            onDelete={practice.deleteQuestion}
          />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={practice.goPrev}
              disabled={practice.currentIndex === 0}
            >
              <ChevronLeft size={16} /> 上一题
            </Button>

            <div className="flex gap-2">
              {!practice.isSubmitted ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={practice.userAnswer.length === 0}
                >
                  <CheckCircle size={16} /> 提交答案
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={practice.currentIndex >= practice.questions.length - 1}
                >
                  下一题 <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
