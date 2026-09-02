import React from "react";
import { UsageBadge } from "./UsageBadge";
import { UserBadge } from "./UserBadge";

export function BrandHeader({
  onOpenSettings,
  onOpenJournals,
  onOpenUsage,
  onOpenProfile,
}) {
  return (
    <header className="brand-bar">
      <div>
        <div className="brand-mark">
          <span className="glyph"></span>철학자와 대화
        </div>
        <div className="catalog-tag brand-sub">
          중학 도덕 철학 상담소 · Ethics Studio
        </div>
      </div>
      <div className="header-actions">
        {/* 학생 프로필 뱃지 */}
        <UserBadge onClick={onOpenProfile} />

        {/* 사용량 뱃지 */}
        <UsageBadge onClick={onOpenUsage} />

        <button
          className="nav-action-btn primary"
          onClick={onOpenJournals}
          title="제출된 전체 성찰 일지 및 대화 기록 보관함"
        >
          📚 학습 기록 보관함
        </button>

        <button
          className="nav-action-btn"
          onClick={onOpenSettings}
          title="생성형 AI API 키 및 모델 설정"
        >
          ⚙️ AI 설정
        </button>
      </div>
    </header>
  );
}
