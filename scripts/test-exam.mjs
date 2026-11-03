import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const file=new URL('../src/services/examSampling.ts',import.meta.url);
const compiled=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {sampleExam}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const all=[1,3].flatMap(s=>JSON.parse(readFileSync(new URL(`../src/data/questions/chapter${s}.json`,import.meta.url),'utf8')));
for(const subject of [0,1,3])for(let run=0;run<20;run++) {
 const pool=subject?all.filter(q=>q.chapter===subject):all;
 const exam=sampleExam(pool);
 assert.equal(exam.length,100);assert.equal(new Set(exam.map(q=>q.id)).size,100);
 assert.ok(exam.every(q=>!subject||q.chapter===subject));
 assert.equal(exam.filter(q=>q.trainingKind==='composite').length,25);
 const concepts=exam.flatMap(q=>q.components?.map(c=>c.seedId)||[q.id]);
 assert.equal(new Set(concepts).size,concepts.length,'no quoted base question repeated within paper');
}
for(const size of [0,1,12,99]) {
 const exam=sampleExam(all.slice(0,size));assert.equal(exam.length,size);assert.equal(new Set(exam.map(q=>q.id)).size,size);
}
console.log('60 full mock samples verified (subjects 1/3/mixed), plus small-pool fallback.');
