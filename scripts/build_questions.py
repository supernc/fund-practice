#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将基金从业资格考试题库（原始 questions.json）转换为刷题平台所需的题目格式。

原始格式：
    {
      "q": "题干", "options": ["A选项", "B选项", "C选项", "D选项"],
      "answer": 2,            # 0 基索引的正确项
      "explain": "解析",
      "id": "xxxx", "subject": "科目一", "chapter": "金融市场与资产管理"
    }

输出格式（每个科目一个文件）：
    src/data/questions/chapter1.json  -> 科目一
    src/data/questions/chapter2.json  -> 科目二

    {
      "id": "k1-0001", "stem": "...",
      "options": [{"label": "A", "text": "..."}, ...],
      "answer": ["C"], "type": "single",
      "chapter": 1, "subChapter": "s1-1",
      "tags": ["金融市场与资产管理"], "analysis": "...", "difficulty": 2
    }
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, "data", "questions_source.json")
OUT_DIR = os.path.join(ROOT, "src", "data", "questions")

LABELS = ["A", "B", "C", "D", "E", "F"]

# 科目 -> (chapter 编号, 科目全称, [教材章节名...])
SUBJECTS = [
    (1, "科目一", "基金法律法规、职业道德与业务规范", [
        "金融市场与资产管理",
        "基金概述",
        "基金法律法规体系和监管体系",
        "基金市场参与主体及其从业人员的法规要求",
        "基金活动的法规要求",
        "基金管理人的合规管理、风险管理和内部控制",
        "基金职业道德规范",
        "基金行业文化建设",
    ]),
    (2, "科目二", "证券投资基金基础知识", [
        "证券投资基金概述",
        "基金的类型",
        "投资管理基础",
        "权益投资",
        "固定收益投资",
        "衍生工具",
        "另类投资",
        "投资管理流程",
        "投资组合管理",
        "投资交易管理",
        "投资风险管理",
        "基金业绩评价",
        "基金的募集、交易与登记",
        "基金的投资交易与结算",
        "基金的估值、费用与会计核算",
        "基金的利润分配与税收",
        "基金的信息披露",
        "基金销售基础知识",
    ]),
]

# 计算题关键词（用于「计算题专练」抽题）
# 强关键词：出现即认定考查计算/定量方法
CALC_STRONG = [
    "计算", "收益率", "久期", "凸性", "夏普", "特雷诺", "信息比率",
    "方差", "标准差", "相关系数", "协方差", "现值", "终值", "贴现",
    "复利", "年化", "折溢价", "内在价值", "时间加权", "算术平均",
    "几何平均", "加权平均", "基点价值",
]
# 弱关键词：本身是名词（净值、市盈率…），只有题干带具体数字时才算计算题
CALC_WEAK = [
    "净值", "市盈率", "市净率", "波动率", "单利", "净利率",
]

DIGIT = re.compile(r"[0-9０-９]")


def is_calc(text: str) -> bool:
    if any(h in text for h in CALC_STRONG):
        return True
    return any(h in text for h in CALC_WEAK) and bool(DIGIT.search(text))


def main():
    src_path = SRC if os.path.exists(SRC) else sys.argv[1]
    with open(src_path, encoding="utf-8") as f:
        raw = json.load(f)
    print(f"读取原始题目：{len(raw)} 道（{src_path}）")

    os.makedirs(OUT_DIR, exist_ok=True)

    total = 0
    for ch_no, subj_name, subj_full, chapters in SUBJECTS:
        idx_of = {name: i + 1 for i, name in enumerate(chapters)}
        buckets = {name: [] for name in chapters}
        unknown = []

        for q in raw:
            if q.get("subject") != subj_name:
                continue
            cname = (q.get("chapter") or "").strip()
            if cname not in buckets:
                unknown.append(cname)
                continue
            buckets[cname].append(q)

        out = []
        seq = 0
        for name in chapters:
            sub_id = f"s{ch_no}-{idx_of[name]}"
            for q in buckets[name]:
                seq += 1
                ans_idx = q["answer"]
                if not isinstance(ans_idx, int) or not (0 <= ans_idx < len(q["options"])):
                    raise ValueError(f"答案越界：{q.get('id')}")
                stem = q["q"].strip()
                tags = [name]
                if is_calc(stem):
                    tags.append("计算题")
                out.append({
                    "id": f"k{ch_no}-{seq:04d}",
                    "stem": stem,
                    "options": [
                        {"label": LABELS[i], "text": str(t).strip()}
                        for i, t in enumerate(q["options"])
                    ],
                    "answer": [LABELS[ans_idx]],
                    "type": "single",
                    "chapter": ch_no,
                    "subChapter": sub_id,
                    "tags": tags,
                    "analysis": (q.get("explain") or "").strip(),
                    "difficulty": 2,
                })

        dst = os.path.join(OUT_DIR, f"chapter{ch_no}.json")
        with open(dst, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
            f.write("\n")

        total += len(out)
        calc_n = sum(1 for x in out if "计算题" in x["tags"])
        print(f"  chapter{ch_no}.json  {subj_full}: {len(out)} 题（计算题 {calc_n}）  章节数 {len(chapters)}")
        if unknown:
            print(f"    !! 未匹配章节：{sorted(set(unknown))}")

    print(f"合计输出：{total} 题")


if __name__ == "__main__":
    main()
