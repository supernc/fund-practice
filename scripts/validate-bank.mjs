import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));
const manifest = read('bank-manifest.json');
const banks = [read('questions/chapter1.json'), read('questions/chapter3.json')];
const all = banks.flat();
assert.equal(new Set(all.map(q => q.id)).size, all.length, 'duplicate IDs');
for (const [i,bank] of banks.entries()) {
  assert.ok(bank.length >= 100, 'each subject must support a full mock');
  assert.equal(new Set(bank.map(q => q.stem.replace(/\s/g, ''))).size, bank.length, 'duplicate stems');
  const subject = i === 0 ? 1 : 3;
  assert.equal(bank.length, manifest.subjects[String(subject)]);
  assert.equal(new Set(bank.map(q => q.subChapter)).size, subject === 1 ? 8 : 9);
  for (const q of bank) {
    assert.equal(q.chapter,subject);
    assert.ok(q.subChapter.startsWith(`s${subject}-`));
    assert.equal(q.type,'single');
    assert.deepEqual(q.options.map(o => o.label),['A','B','C','D']);
    assert.equal(new Set(q.options.map(o => o.text)).size,4);
    assert.equal(q.answer.length,1);
    assert.ok(q.options.some(o => o.label===q.answer[0]));
    assert.ok(q.stem && q.analysis);
    assert.ok(q.sources?.length && q.sources.every(s => s.locator && new URL(s.url).protocol === 'https:'));
    assert.equal(q.reviewedAt,manifest.reviewedAt);
    assert.equal(q.bankVersion,manifest.version);
    assert.ok(!q.tags.includes('来源待核验'));
  }
}
assert.ok(!banks[0].some(q => q.id.startsWith('k1-')), 'retired legacy questions must not be active');
const correct = q => q.options.find(o=>o.label===q.answer[0]).text;
const find = stem => all.find(q=>q.stem===stem);
assert.equal(correct(find('按2026年规则，私募股权投资基金通常应披露哪些定期报告？')),'半年度报告和年度报告');
assert.equal(correct(find('私募股权基金年度报告应在每年度结束后多久内披露？')),'六个月');
assert.equal(correct(find('客户身份资料在业务关系结束后至少应保存多久？')),'十年');
assert.equal(correct(find('基金投资收益指标中，三年以上中长期指标权重最低为？')),'80%');
assert.equal(correct(find('基金累计实缴2000万元，已分配1200万元，剩余权益价值1800万元。TVPI为？')),'1.5倍');
console.log(`Validated ${banks[0].length} + ${banks[1].length} questions, sources, chapters, and updated-rule regressions.`);

assert.deepEqual(banks.map(b=>b.length),[1000,800]);
const roman=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
const groups=new Set();
const byId=new Map(all.map(q=>[q.id,q]));
for(const q of all.filter(q=>q.trainingKind==='composite')) {
  assert.equal(q.components.length,4);
  const ids=q.components.map(c=>c.seedId);
  assert.equal(new Set(ids).size,4,'four distinct base questions per composite');
  const key=[...ids].sort().join('|');
  assert.ok(!groups.has(key),'repeated constituent group');groups.add(key);
  const truths=q.components.map(c=>{
    const seed=byId.get(c.seedId);assert.ok(seed && seed.trainingKind==='standalone');
    assert.equal(seed.subChapter,q.subChapter);
    const option=seed.options.find(o=>o.label===c.proposedLabel);assert.equal(option.text,c.proposedAnswer);
    assert.equal(seed.answer.includes(c.proposedLabel),c.isCorrect);
    return c.isCorrect;
  });
  const expected=roman.filter((_,i)=>truths[i]).join('、');
  assert.equal(correct(q),expected,'composite answer must match every proposed answer');
  for(let i=0;i<4;i++) assert.ok(q.analysis.includes(`${roman[i]}：答复${truths[i]?'正确':'错误'}`));
}
for(const subject of [1,3]) {
 const bank=banks[subject===1?0:1];
 assert.deepEqual(Array.from({length:manifest.expansion[subject].chapters.length},(_,i)=>bank.filter(q=>q.subChapter===`s${subject}-${i+1}`).length),manifest.expansion[subject].chapters);
 assert.equal(bank.filter(q=>q.trainingKind==='standalone').length,manifest.expansion[subject].standalone);
 assert.equal(bank.filter(q=>q.trainingKind==='composite').length,manifest.expansion[subject].composite);
}
console.log(`All ${groups.size} composite keys, statement judgments, source IDs and chapter quotas validated.`);
