import React from "react";

/**
 * 하단 토스트 알림 컴포넌트
 * @param {{ message: string }} props
 */
export function Toast({ message }) {
  return (
    <div className={`toast ${message ? "show" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
