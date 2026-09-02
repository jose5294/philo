import React, { useState, useEffect } from "react";
import { usageTracker } from "../../services/usageTracker";

/**
 * 상단 헤더에 실시간으로 일일 사용량 현황을 보여주는 뱃지 버튼
 */
export function UsageBadge({ onClick }) {
  const [usage, setUsage] = useState(usageTracker.getUsage());

  useEffect(() => {
    const handler = () => setUsage(usageTracker.getUsage());
    window.addEventListener("mind_dialogue_usage_updated", handler);
    return () => window.removeEventListener("mind_dialogue_usage_updated", handler);
  }, []);

  return (
    <button
      className={`usage-badge ${usage.isRpmWarning ? "warning" : ""}`}
      onClick={onClick}
      title="클릭하여 오늘의 AI 일일 사용량 및 한도 상세 보기"
    >
      <span className="badge-dot"></span>
      <span className="badge-text">
        ⚡ 오늘 <strong>{usage.todayCount}</strong> / {usage.rpdLimit}회
      </span>
    </button>
  );
}
