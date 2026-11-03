import { ChapterInfo } from '../types';

// 基金从业资格考试 · 两个科目
// 科目一《基金基础知识与法律法规》 —— 必考
// 科目三《私募股权投资基金基础知识》 —— 选考（私募股权方向）
export const chapters: ChapterInfo[] = [
  {
    id: 1,
    name: '科目一 · 基金基础知识与法律法规',
    description: '金融市场与资产管理、基金概述、法律法规与监管体系、从业人员法规要求、基金活动规范、合规与内控、职业道德、行业文化',
    weight: 50,
    wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995319242.pdf',
    subChapters: [
      { id: 's1-1', name: '第1章 金融市场与资产管理', wikiUrl: '' },
      { id: 's1-2', name: '第2章 基金概述', wikiUrl: '' },
      { id: 's1-3', name: '第3章 基金法律法规体系和监管体系', wikiUrl: '' },
      { id: 's1-4', name: '第4章 基金市场参与主体及其从业人员的法规要求', wikiUrl: '' },
      { id: 's1-5', name: '第5章 基金活动的法规要求', wikiUrl: '' },
      { id: 's1-6', name: '第6章 合规管理、风险管理和内部控制', wikiUrl: '' },
      { id: 's1-7', name: '第7章 基金职业道德规范', wikiUrl: '' },
      { id: 's1-8', name: '第8章 基金行业文化建设', wikiUrl: '' },
    ],
  },
  {
    id: 3,
    name: '科目三 · 私募股权投资基金基础知识',
    description: '股权投资基金募、投、管、退及基金治理和运营',
    weight: 50,
    wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf',
    subChapters: [
      { id: 's3-1', name: '第1章 股权投资基金概述', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-2', name: '第2章 股权投资基金管理人', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-3', name: '第3章 股权投资基金产品', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-4', name: '第4章 股权投资基金的募集与设立', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-5', name: '第5章 股权投资基金的投资', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-6', name: '第6章 股权投资基金的投后管理', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-7', name: '第7章 股权投资基金的项目退出', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-8', name: '第8章 股权投资基金治理', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
      { id: 's3-9', name: '第9章 股权投资基金的运营管理', wikiUrl: 'https://www.amac.org.cn/xwfb/tzgg/202606/P020260630399995526911.pdf' },
    ],
  },
];

export default chapters;
