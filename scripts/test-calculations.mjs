import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../src/data/questions/chapter3.json',import.meta.url),'utf8'));
const result=prefix=>{const q=bank.find(q=>q.trainingKind==='standalone'&&q.stem.startsWith(prefix));assert.ok(q,prefix);return q.options.find(o=>q.answer.includes(o.label)).text;};
const money=n=>`${n}万元`;
const checks=[
 ['目标企业净资产账面值3000万元',money(3000*2)],
 ['目标企业EBITDA为1200万元',money(1200*8-2000)],
 ['企业价值9000万元',money(9000-(1000-2000))],
 ['一年后和两年后分别取得110万元',money(Math.round(110/1.1+121/1.1**2))],
 ['假设一年后首笔现金流100万元，此后永久',money(100/.1)],
 ['假设一年后首笔现金流100万元，此后永续',money(Math.round(100/(.12-.02)))],
 ['企业第二年末终值估算为1210万元',money(Math.round(1210/1.1**2))],
 ['创业企业预计退出时股权价值2亿元',money(20000/4)],
 ['预计退出时企业股权价值3亿元',money(30000*.2/3)],
 ['企业投前估值8000万元',money(8000*.2/(1-.2))],
 ['某基金原持股30%',`${30*(1-.2)}%`],
 ['某投资者享有非参与型优先清算权',money(Math.max(1000,6000*.2))],
 ['按明确约定的参与型分配',money(1000+4000*.2)],
 ['某基金资产公允价值合计5000万元',money(5000-500)],
 ['基金净资产4500万元',`${(4500/3000).toFixed(2)}元`],
 ['基金总收益倍数TVPI为1.8倍',`${(1.8-.7).toFixed(1)}倍`],
 ['基金已分配1000万元，剩余价值2500万元',money((1000+2500)/1.4)],
 ['投资者期初投入100万元，一年后一次收回90万元',`${Math.round((90/100-1)*100)}%`],
 ['假设合同规定按认缴规模1亿元',money(10000*.02)],
 ['假设合同改为按实缴6000万元',money(6000*.02)],
 ['假设基金全额返还投资者本金1000万元',money(500*.2)],
 ['假设基金回款1500万元',money(1000+500*(1-.2))],
 ['按合同约定的整体基金结算',money(120-80)],
 ['基金累计实缴2000万元，已分配1000万元，未退出资产',`${(1000+2400)/2000}倍`],
];
for(const [prefix,expected] of checks)assert.equal(result(prefix),expected,prefix);
assert.ok(Math.abs(-100+10/1.1+110/1.1**2)<1e-10,'multi-period IRR cashflow equation');
console.log(`${checks.length} financial calculation answers independently recomputed.`);
