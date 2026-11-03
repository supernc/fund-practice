// Reproducible authored seeds + multi-point reasoning questions.
// Composite questions use four DIFFERENT seed questions and a unique unordered
// group. Their answers are derived from each seed's one correct answer.
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const write=(p,x)=>writeFileSync(new URL(p,root),JSON.stringify(x,null,2)+'\n');
const version='2026.11.03.2',reviewedAt='2026-11-03';
const manifest=read('src/data/bank-manifest.json');
const newSources=[
 {id:'private',title:'私募投资基金监督管理条例',url:'https://www.mee.gov.cn/zcwj/gwywj/202307/t20230710_1035724.shtml'},
 {id:'suitability',title:'证券期货投资者适当性管理办法（2022修正）',url:'https://www.csrc.gov.cn/csrc/c101953/c5359211/5359211/files/%E9%99%84%E4%BB%B61.1%EF%BC%9A%E4%B8%AD%E5%9B%BD%E8%AF%81%E7%9B%91%E4%BC%9A%E5%86%B3%E5%AE%9A%E4%BF%AE%E6%94%B9%E7%9A%84%E8%A7%84%E7%AB%A0.pdf'},
 {id:'sales',title:'公开募集证券投资基金销售机构监督管理办法',url:'https://www.csrc.gov.cn/csrc/c106256/c1653806/content.shtml'},
 {id:'valuation',title:'私募投资基金非上市股权投资估值指引',url:'https://www.amac.org.cn/businessservices_2025/trusteeshipbusiness_2912/tgfwgzglgj/tgfwtzyj/202105/P020210727701551843577.pdf'},
];
for(const source of newSources)if(!manifest.sources.some(s=>s.id===source.id))manifest.sources.push(source);
const sources=Object.fromEntries(manifest.sources.map(s=>[s.id,s]));
const hash=s=>createHash('sha256').update(s).digest('hex');
let rngState=202611032;
function random(){rngState=(Math.imul(1664525,rngState)+1013904223)>>>0;return rngState/4294967296;}
function shuffle(x){const a=[...x];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const foundations={1:read('scripts/data/foundation-subject1.json'),3:read('scripts/data/foundation-subject3.json')};
for(const [n,line] of readFileSync(new URL('scripts/data/extra-items.tsv',root),'utf8').trim().split('\n').entries()){
 const parts=line.split('|');assert.equal(parts.length,10,`line ${n+1}`);
 const [subjectString,ch,key,loc,stem,a,b,c,d,analysis]=parts,subject=Number(subjectString);
 assert.ok(sources[key],`unknown source ${key}`);
 const opts=shuffle([a,b,c,d]);const id=`v20261103-extra-k${subject}-${hash(stem).slice(0,12)}`;
 const s=sources[key];
 foundations[subject].push({id,stem,options:opts.map((text,i)=>({label:'ABCD'[i],text})),answer:['ABCD'[opts.indexOf(a)]],type:'single',chapter:subject,subChapter:`s${subject}-${ch}`,tags:['2026大纲模拟','情景与应用','普通单选',...(loc.includes('计算题')?['计算题']:[])],analysis,difficulty:2,sources:[{title:s.title,url:s.url,locator:loc}],reviewedAt,bankVersion:version,reviewScope:'按所列考点与规则编写的模拟题，未经考试主办方审定',syllabusCode:`${ch}.x`,trainingKind:'standalone'});
}
const revisions=readFileSync(new URL('scripts/data/distractor-revisions.tsv',root),'utf8').trim().split('\n').map(line=>line.split('|'));
let revised=0;
for(const bank of Object.values(foundations))for(const q of bank){
 const revision=revisions.find(row=>q.stem.startsWith(row[0]));
 if(revision){let j=1;for(const option of q.options)if(!q.answer.includes(option.label))option.text=revision[j++];revised++;}
}
const quotas={1:[100,120,90,180,260,100,100,50],3:[65,90,100,110,150,70,70,50,95]};
const roman=['Ⅰ','Ⅱ','Ⅲ','Ⅳ'];
const groupUsed=new Set();
const stats={};
for(const subject of [1,3]){
 const bank=foundations[subject].map(q=>({...q,bankVersion:version,reviewedAt,trainingKind:'standalone',tags:[...new Set([...q.tags,'普通单选'])]}));
 const seedById=new Map(bank.map(q=>[q.id,q]));
 const newQuestions=[];
 for(let ch=1;ch<=quotas[subject].length;ch++){
  const pool=bank.filter(q=>q.subChapter===`s${subject}-${ch}`);
  const needed=quotas[subject][ch-1]-pool.length;
  assert.ok(needed>=0,`quota below seed count ${subject} ${ch}`);
  const pairCounts=new Map();
  for(let i=0;i<needed;i++){
   let chosen,pairs,key;
   for(let attempt=0;;attempt++){
    assert.ok(attempt<20000,`cannot make unique group ${subject} ${ch}`);
    chosen=shuffle(pool).slice(0,4);
    key=chosen.map(q=>q.id).sort().join('|');
    pairs=[];
    for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)pairs.push([chosen[a].id,chosen[b].id].sort().join('|'));
    // Limit re-use of a particular pair, not merely exact duplicate stems.
    const pairLimit=attempt<1000?6:10;
    if(!groupUsed.has(key)&&pairs.every(p=>(pairCounts.get(p)||0)<pairLimit))break;
   }
   groupUsed.add(key);for(const p of pairs)pairCounts.set(p,(pairCounts.get(p)||0)+1);
   const trueCount=1+(i%3);
   const trueIndices=new Set(shuffle([0,1,2,3]).slice(0,trueCount));
   const components=chosen.map((seed,j)=>{
    const valid=seed.options.find(o=>seed.answer.includes(o.label));
    const invalid=seed.options.filter(o=>!seed.answer.includes(o.label));
    const plausible=invalid.filter(o=>!/(Logo|logo|网页|名片|字体|办公室|网站访问|广告点击|笔画|尾数|二维码)/.test(o.text));
    const isCorrect=trueIndices.has(j);
    const proposed=isCorrect?valid:shuffle(plausible.length?plausible:invalid)[0];
    return {seedId:seed.id,proposedLabel:proposed.label,isCorrect,proposedAnswer:proposed.text};
   });
   const mask=components.reduce((m,c,j)=>m|(c.isCorrect?(1<<j):0),0);
   const maskText=m=>roman.filter((_,j)=>m&(1<<j)).join('、');
   const closeWrong=shuffle(Array.from({length:15},(_,i)=>i+1).filter(m=>m!==mask));
   const optionMasks=shuffle([mask,...closeWrong.slice(0,3)]);
   const options=optionMasks.map((m,j)=>({label:'ABCD'[j],text:maskText(m)}));
   const qStem='某机构复核以下四条业务培训问答。答复正确的有（）。\n'+components.map((c,j)=>`${roman[j]}．问：${chosen[j].stem}\n答：${c.proposedAnswer}`).join('\n');
   const analysis=components.map((c,j)=>{
    const seed=chosen[j],valid=seed.options.find(o=>seed.answer.includes(o.label));
    return `${roman[j]}：答复${c.isCorrect?'正确':'错误'}。${c.isCorrect?'':'正确答复应为“'+valid.text+'”。'}${seed.analysis}`;
   }).join('\n\n');
   const sourceMap=new Map();for(const seed of chosen)for(const source of seed.sources)sourceMap.set(source.url+'|'+source.locator,source);
   const q={id:`v20261103-composite-k${subject}-${hash(key).slice(0,14)}`,stem:qStem,options,answer:[options[optionMasks.indexOf(mask)].label],type:'single',chapter:subject,subChapter:`s${subject}-${ch}`,tags:['2026大纲模拟','组合单选','多考点辨析'],analysis,difficulty:3,syllabusCode:`第${ch}章综合`,reviewedAt,reviewScope:'由四条已列依据的基础问答组合，逐条核对答复正误；非官方题',sources:[...sourceMap.values()],bankVersion:version,trainingKind:'composite',components};
   // Independent derivation: proposed answer is correct iff it is seed answer.
   assert.deepEqual(components.map(c=>seedById.get(c.seedId).answer.includes(c.proposedLabel)),components.map(c=>c.isCorrect));
   newQuestions.push(q);
  }
 }
 const result=[...bank,...newQuestions];assert.equal(result.length,subject===1?1000:800);
 assert.equal(new Set(result.map(q=>q.stem.replace(/\s/g,''))).size,result.length);
 write(`src/data/questions/chapter${subject}.json`,result);
 stats[subject]={standalone:bank.length,composite:newQuestions.length,chapters:quotas[subject],componentGroupDuplicates:0};
}
manifest.version=version;manifest.reviewedAt=reviewedAt;manifest.subjects={'1':1000,'3':800};
manifest.expansion=stats;
manifest.scope='2026大纲模拟题：普通单选、情景应用、计算题和多考点组合辨析。1800为题目数，不代表1800个独立知识点。全部开放练习及随机模考，不预留题目。';
manifest.publicStudyReferences=[
 {title:'233网校：公开模拟题目录（题型与考点参考）',url:'https://www.233.com/jjcy/moniti/index02.html'},
 {title:'233网校：股权估值应用公开例题（题型参考）',url:'https://www.233.com/jjcy/smgq/moniti/202603/23152914863148.html'},
 {title:'考试100：公开基金章节目录（覆盖范围参考）',url:'https://www.kaoshi100.cn/ks100/tiku/8502/850202.html'},
];
write('src/data/bank-manifest.json',manifest);
write('scripts/data/expansion-report.json',{version,subjects:stats,notes:['普通情景题人工编写；组合题以四条不同基础问答作综合辨析。','不靠更换人名或数字生成同题；每个四题集合只使用一次。','同一考点会在不同组合中复现；题目数量不能视为独立考点数量。','全部题目开放练习，不设置模考专用预留。']});
console.log(JSON.stringify(stats,null,2));
