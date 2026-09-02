/**
 * AI 일일 사용량 및 분당 한도(RPM/RPD) 추적 서비스
 * - Google Gemini 무료 한도 기준: 일일 1,500회 (RPD), 분당 20회 (RPM)
 * - 매일 자정(00:00) 자동 리셋
 */

const STORAGE_KEY_PREFIX = "mind_dialogue_daily_usage:";
const RPM_TIMESTAMPS_KEY = "mind_dialogue_rpm_timestamps";

export const usageTracker = {
  getTodayKey() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${STORAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`;
  },

  /**
   * 오늘의 사용량 및 실시간 분당 사용량 정보 조회
   */
  getUsage() {
    const key = this.getTodayKey();
    let todayCount = 0;
    try {
      todayCount = parseInt(localStorage.getItem(key) || "0", 10);
    } catch (e) {}

    // 최근 60초간의 요청 타임스탬프 계산 (RPM)
    let timestamps = [];
    try {
      const raw = localStorage.getItem(RPM_TIMESTAMPS_KEY);
      if (raw) timestamps = JSON.parse(raw);
    } catch (e) {}

    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentTimestamps = timestamps.filter((t) => t > oneMinuteAgo);

    // 갱신 저장
    try {
      localStorage.setItem(RPM_TIMESTAMPS_KEY, JSON.stringify(recentTimestamps));
    } catch (e) {}

    const rpdLimit = 1500; // 일일 무료 한도
    const rpmLimit = 20;   // 분당 무료 한도
    const rpmCount = recentTimestamps.length;
    const remainingToday = Math.max(0, rpdLimit - todayCount);
    const percentage = Math.min(100, Math.round((todayCount / rpdLimit) * 100));

    return {
      todayCount,
      rpdLimit,
      remainingToday,
      percentage,
      rpmCount,
      rpmLimit,
      isRpmWarning: rpmCount >= 15,
      isRpdWarning: todayCount >= 1400,
    };
  },

  /**
   * AI 대화 질문 발생 시 카운트 증가
   */
  recordUsage() {
    const key = this.getTodayKey();
    const current = parseInt(localStorage.getItem(key) || "0", 10);
    try {
      localStorage.setItem(key, String(current + 1));
    } catch (e) {}

    // RPM 타임스탬프 기록
    let timestamps = [];
    try {
      const raw = localStorage.getItem(RPM_TIMESTAMPS_KEY);
      if (raw) timestamps = JSON.parse(raw);
    } catch (e) {}

    const oneMinuteAgo = Date.now() - 60 * 1000;
    const updated = [...timestamps.filter((t) => t > oneMinuteAgo), Date.now()];
    try {
      localStorage.setItem(RPM_TIMESTAMPS_KEY, JSON.stringify(updated));
    } catch (e) {}

    // 이벤트 브로드캐스트
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mind_dialogue_usage_updated"));
    }
  },

  /**
   * 오늘 사용량 초기화 (테스트용)
   */
  resetToday() {
    try {
      localStorage.setItem(this.getTodayKey(), "0");
      localStorage.setItem(RPM_TIMESTAMPS_KEY, "[]");
    } catch (e) {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mind_dialogue_usage_updated"));
    }
  },
};
