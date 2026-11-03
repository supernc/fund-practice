import { ExternalLink, BookOpen, CalendarDays } from 'lucide-react';
import manifest from '../data/bank-manifest.json';
import { chapters } from '../data/chapters';
import { getRawQuestions } from '../data';

export default function BankInfoPage() {
  const questions = getRawQuestions();
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="card-glow rounded-2xl bg-bg-secondary p-6 space-y-3">
        <h1 className="text-2xl font-bold gradient-text">2026 大纲 · 题库说明</h1>
        <p className="text-sm text-text-secondary flex gap-2 items-center"><CalendarDays size={16} /> 核对日期 {manifest.reviewedAt} · 版本 {manifest.version}</p>
        <p className="text-sm text-text-primary leading-relaxed">当前使用科目一 {manifest.subjects['1']} 道、科目三 {manifest.subjects['3']} 道模拟题。两科均支持随机抽取 100 题、120 分钟自测。</p>
        <p className="text-sm text-text-secondary leading-relaxed">全部题目开放日常练习，模考从同一题库抽取，不设置预留题。</p>
        <p className="text-sm text-text-secondary leading-relaxed">本次核查发现旧库存在已废止规则和新旧口径混用。原科目一 {manifest.retiredLegacyQuestions} 道题已退出当前练习和模考；按现行大纲重新编写科目一，并补充科目三新规与计算题。旧题和历史修改可在 GitHub 记录中追溯。</p>
        <p className="text-sm text-text-secondary leading-relaxed">题目由本站编写，未经考试主办方审定。解析中的大纲链接用于定位考点，法律法规及自律规则链接用于核对相应规定。基础概念题没有声称出自官方真题；题库覆盖各章，但不代表穷尽所有考点。</p>
      </section>
      <section className="card-glow rounded-2xl bg-bg-secondary p-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">题型构成与学习顺序</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead><tr className="border-b border-white/10"><th className="py-2">科目</th><th>普通、情景与计算题</th><th>综合辨析题</th><th>合计</th></tr></thead>
            <tbody>{([1,3] as const).map(s => <tr key={s} className="border-b border-white/5"><td className="py-2">科目{s === 1 ? '一' : '三'}</td><td>{manifest.expansion[s].standalone}</td><td>{manifest.expansion[s].composite}</td><td>{manifest.subjects[s]}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">1800道是题目数量，不代表1800个独立知识点。综合题把同章四条不同基础问答放在一起，要求逐条辨析；同一考点会在不同组合中复现。每个四题组合仅使用一次，解析逐条说明正误和正确口径。</p>
        <p className="text-sm text-text-secondary leading-relaxed">可在科目练习中先筛选“普通与情景题”，再练“综合辨析题”。常规模考混合75道普通与情景题、25道组合题，并避免卷内重复引用同一基础问答；该安排不表示官方考试题型比例。</p>
      </section>
      <section className="card-glow rounded-2xl bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">章节覆盖</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {chapters.map(subject => <div key={subject.id}>
            <h3 className="text-sm font-semibold text-primary-light mb-3">{subject.name}</h3>
            <ul className="space-y-2 text-sm text-text-secondary">{subject.subChapters.map(chapter => <li key={chapter.id} className="flex justify-between gap-3"><span>{chapter.name}</span><span className="shrink-0">{questions.filter(q => q.subChapter === chapter.id).length} 题</span></li>)}</ul>
          </div>)}
        </div>
      </section>
      <section className="card-glow rounded-2xl bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">本次发现并替换的问题</h2>
        <ul className="space-y-4">{manifest.changes.map(change => {
          const source = manifest.sources.find(s => s.id === change.source)!;
          return <li key={change.id} className="text-sm text-text-secondary border-b border-white/5 pb-3">
            <p><span className="text-text-muted">旧题 {change.id}：</span>{change.reason}</p>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-light mt-1 hover:underline"><ExternalLink size={12} />{source.title}</a>
          </li>;
        })}</ul>
      </section>
      <section className="card-glow rounded-2xl bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3 flex gap-2 items-center"><BookOpen size={18} /> 官方依据</h2>
        <p className="text-xs text-text-muted mb-4">依据是否仍然有效比网页发布日期更重要。2026年新规按其生效日期适用；已发布的征求意见稿不直接作为现行规则出题。</p>
        <ul className="space-y-3">{manifest.sources.map(source => <li key={source.id}><a className="inline-flex gap-2 items-start text-sm text-primary-light hover:underline" href={source.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} className="shrink-0 mt-0.5" />{source.title}</a></li>)}</ul>
      </section>
      <section className="card-glow rounded-2xl bg-bg-secondary p-6 space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">公开学习资料与题型参考</h2>
        <p className="text-xs text-text-muted">参考公开例题的题型、章节范围和学习思路；本站新题自行编写，不把商业网站的“真题”标签视为官方认定，也未批量转载付费题库。</p>
        <ul className="space-y-3">{manifest.publicStudyReferences.map(source => <li key={source.url}><a className="text-sm text-primary-light hover:underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
      </section>
    </div>
  );
}
