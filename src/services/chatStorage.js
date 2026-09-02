/**
 * 대화 로그 영구 저장 및 복원 서비스
 * - 사용자 ID와 철학자 ID를 조합하여 대화 기록을 분리 보관
 * - 브라우저 닫기, 새로고침, 뒤로가기 시에도 이전 대화 완벽 보존
 */

const CHAT_PREFIX = "mind_dialogue_chat_history:";

export const chatStorage = {
  getStorageKey(userId, philosopherId) {
    const uId = userId || "guest";
    return `${CHAT_PREFIX}${uId}:${philosopherId}`;
  },

  /**
   * 특정 사용자와 철학자 간의 저장된 대화 로그 불러오기
   * @param {string} userId
   * @param {string} philosopherId
   * @param {string} defaultHook - 저장된 대화가 없을 때 기본으로 노출할 철학자의 첫 질문
   * @returns {Array<{ role: string, text: string, timestamp?: number }>}
   */
  getChatHistory(userId, philosopherId, defaultHook) {
    const key = this.getStorageKey(userId, philosopherId);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[ChatStorage] Failed to load chat history", e);
    }

    // 기본 첫 대화 반환
    return defaultHook ? [{ role: "philo", text: defaultHook, timestamp: Date.now() }] : [];
  },

  /**
   * 대화 로그 실시간 저장
   * @param {string} userId
   * @param {string} philosopherId
   * @param {Array<{ role: string, text: string }>} messages
   */
  saveChatHistory(userId, philosopherId, messages) {
    if (!messages || messages.length === 0) return;
    const key = this.getStorageKey(userId, philosopherId);
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.warn("[ChatStorage] Failed to save chat history", e);
    }
  },

  /**
   * 대화 초기화 (새로운 대화 시작)
   * @param {string} userId
   * @param {string} philosopherId
   * @param {string} defaultHook
   */
  clearChatHistory(userId, philosopherId, defaultHook) {
    const key = this.getStorageKey(userId, philosopherId);
    try {
      localStorage.removeItem(key);
    } catch (e) {}

    return defaultHook ? [{ role: "philo", text: defaultHook, timestamp: Date.now() }] : [];
  },

  /**
   * 해당 사용자가 나눈 모든 사상가와의 대화 로그 조회 (대화 다시보기용)
   * @param {string} userId
   * @returns {Array<{ philosopherId: string, messages: Array<any>, updatedAt: number }>}
   */
  getAllUserChats(userId) {
    const uId = userId || "guest";
    const prefix = `${CHAT_PREFIX}${uId}:`;
    const results = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const philosopherId = key.replace(prefix, "");
          const raw = localStorage.getItem(key);
          if (raw) {
            const messages = JSON.parse(raw);
            if (Array.isArray(messages) && messages.length > 1) {
              results.push({
                philosopherId,
                messages,
                messageCount: messages.length,
                lastMessage: messages[messages.length - 1]?.text || "",
              });
            }
          }
        }
      }
    } catch (e) {}

    return results;
  },
};
