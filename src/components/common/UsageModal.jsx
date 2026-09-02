import React, { useState, useEffect } from "react";
import { usageTracker } from "../../services/usageTracker";

/**
 * 📊 일일 AI 사용량 및 분당 한도 모니터링 모달
 */
export function UsageModal({ isOpen, onClose, onToast }) {
  const [usage, setUsage] = useState(usageTracker.getUsage());

  const refreshUsage = () => {
    setUsage(usageTracker.getUsage());
  };

  useEffect(() => {
    if (isOpen) {
      refreshUsage();
    }
    const handler = () => refreshUsage();
    window.addEventListener("mind_dialogue_usage_updated", handler);
    return () => window.removeEventListener("mind_dialogue_usage_updated", handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm("오늘 사용량 카운터를 초기화하시겠습니까? (테스트용)")) {
      usageTracker.resetToday();
      refreshUsage();
      onToast?.("✓ 오늘 사용량이 초기화되었습니다.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content usage-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">📊 AI 일일 사용량 및 실시간 한도</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="usage-overview">
          {/* 일일 한도 게이지 */}
          <div className="usage-card main">
            <div className="usage-card-header">
              <span className="label">오늘의 누적 질문 횟수 (RPD)</span>
              <span className="reset-tag">매일 00:00 자동 초기화</span>
            </div>
            <div className="usage-numbers">
              <span className="current">{usage.todayCount}</span>
              <span className="slash">/</span>
              <span className="total">{usage.rpdLimit}회 (일일 한도)</span>
            </div>

            {/* 프로그레스 바 */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.max(2, usage.percentage)}%`,
                  background:
                    usage.percentage > 85
                      ? "oklch(0.55 0.18 25)"
                      : usage.percentage > 50
                      ? "oklch(0.65 0.15 70)"
                      : "var(--accent)",
                }}
              ></div>
            </div>

            <div className="usage-card-footer">
              <span>남은 질문 횟수: <strong>{usage.remainingToday.toLocaleString()}회</strong></span>
              <span>사용률: <strong>{usage.percentage}%</strong></span>
            </div>
          </div>

          {/* 분당 실시간 상태 (RPM) */}
          <div className="usage-grid-2">
            <div className="usage-card sub">
              <div className="sub-title">⚡ 분당 질문 속도 (RPM)</div>
              <div className="sub-val">
                <span>{usage.rpmCount}</span> / {usage.rpmLimit} 회
              </div>
              <div className="sub-desc">
                {usage.isRpmWarning ? (
                  <span className="warn">⚠️ 요청이 많습니다 (잠시 대기 권장)</span>
                ) : (
                  <span className="safe">🟢 쾌적하고 안정적인 상태</span>
                )}
              </div>
            </div>

            <div className="usage-card sub">
              <div className="sub-title">🤖 현재 연결 모델</div>
              <div className="sub-val model-name">Gemini 3.6 Flash</div>
              <div className="sub-desc">
                <span className="safe">🟢 자동 백오프 및 페일오버 작동 중</span>
              </div>
            </div>
          </div>
        </div>

        <div className="usage-info-box">
          <div className="info-title">💡 구글 제미나이 무료 혜택 안내</div>
          <ul>
            <li><strong>하루 최대 1,500회</strong>까지 무료로 자유롭게 대화할 수 있습니다. (30명 학급 수업 기준 넉넉함)</li>
            <li><strong>1분에 20회(RPM)</strong> 이상 연속 질문 시 일시적 쿨타임(약 10초)이 발생할 수 있습니다.</li>
            <li>일일 카운터는 <strong>매일 밤 자정(00:00)</strong>에 자동으로 0으로 리셋됩니다.</li>
          </ul>
        </div>

        <div className="modal-footer">
          <button className="btn-clear" onClick={handleReset}>
            카운터 초기화 (테스트용)
          </button>
          <button className="btn-save" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
