import React, { useState } from "react";
import { UsageBadge } from "../common/UsageBadge";
import { UserBadge } from "../common/UserBadge";

/**
 * 대화 상단 헤더 및 네비게이션
 * @param {{
 *   philosopher: import('../../data/philosophers').Philosopher,
 *   onBack: () => void,
 *   onOpenSettings: () => void,
 *   onOpenJournals: () => void,
 *   onOpenUsage: () => void,
 *   onOpenProfile: () => void
 * }} props
 */
export function ChatHeader({
  philosopher,
  onBack,
  onOpenSettings,
  onOpenJournals,
  onOpenUsage,
  onOpenProfile,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="chat-topbar">
      <button className="back-btn" onClick={onBack}>
        ← 다른 철학자 선택하기
      </button>
      <div className="chat-persona">
        <div className="mini-av" style={{ color: philosopher.color }}>
          {philosopher.image && !imgError ? (
            <img
              src={philosopher.image}
              alt={philosopher.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
            />
          ) : (
            philosopher.monogram
          )}
        </div>
        <div>
          <div className="name">{philosopher.name}</div>
          <div className="role">
            {philosopher.nameSub} · {philosopher.school}의 철학자
          </div>
        </div>
      </div>
      <div className="chat-topbar-right">
        <UserBadge onClick={onOpenProfile} />
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
          title="생성형 AI API 키 설정"
        >
          ⚙️ AI 설정
        </button>
      </div>
    </header>
  );
}
