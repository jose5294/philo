import React from "react";

/**
 * 오늘의 질문 배너
 * @param {{ question: string, onCycle: () => void }} props
 */
export function DailyBanner({ question, onCycle }) {
  return (
    <div className="daily-banner">
      <span className="label">오늘의 질문</span>
      <span className="q">{question}</span>
      <button className="cycle" onClick={onCycle} title="다음 질문 보기">
        다른 질문 ↻
      </button>
    </div>
  );
}
