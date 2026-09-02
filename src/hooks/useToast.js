import { useState, useRef, useCallback } from "react";

/**
 * 알림 토스트 상태 관리 훅
 * @param {number} durationMs - 토스트 지속 시간 (기본 2200ms)
 */
export function useToast(durationMs = 2200) {
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setToastMessage("");
    }, durationMs);
  }, [durationMs]);

  return {
    toastMessage,
    showToast,
  };
}
