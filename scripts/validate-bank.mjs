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
