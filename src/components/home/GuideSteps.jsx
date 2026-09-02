import React from "react";

/**
 * 이용 안내 3단계 가이드 섹션
 * 각 단계별 아이콘이나 이미지를 쉽게 변경할 수 있습니다.
 */
export function GuideSteps() {
  const steps = [
    {
      num: "1.",
      icon: "🏛️", // 원하는 이모지, 아이콘, 또는 이미지 태그로 변경 가능
      title: "철학자를 고른다",
      desc: "지금 나의 고민에 어울리는 사상가를 책장에서 선택합니다.",
    },
    {
      num: "2.",
      icon: "💬",
      title: "고민을 나눈다",
      desc: "겪은 상황을 솔직하게 이야기하고, 철학자의 질문에 답해 봅니다.",
    },
    {
      num: "3.",
      icon: "✍️",
      title: "나만의 답을 쓴다",
      desc: "대화를 마친 뒤 성찰 일지에 나의 도덕적 판단을 정리합니다.",
    },
  ];

  return (
    <section className="guide">
      {steps.map((s, idx) => (
        <div className="step" key={idx}>
          <div className="num">{s.num}</div>
          <div className="step-content">
            <div className="t">
              <span className="step-icon">{s.icon}</span> {s.title}
            </div>
            <div className="d">{s.desc}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
