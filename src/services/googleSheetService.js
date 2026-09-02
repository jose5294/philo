/**
 * 구글 스프레드시트 실시간 자동 연동 서비스
 * - 선생님의 구글 스프레드시트 Webhook URL을 시스템에 기본 고정하여 배포
 * - 학생들이 별도 설정할 필요 없이 제출 시 자동으로 선생님 구글 시트에 누적
 */

// 🔒 선생님의 고정 구글 스프레드시트 Webhook 엔드포인트 URL
const DEFAULT_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbxR7jAbyKdC6rgDE3wdg5if40KP5xDpFSdJZxNdRXEXtLePPJDrMMf9TQcawrieLGeHew/exec";

export const googleSheetService = {
  /**
   * 등록된 구글 스프레드시트 Webhook URL 조회 (고정 URL 기본 적용)
   */
  getWebhookUrl() {
    return DEFAULT_SHEET_WEBHOOK_URL;
  },

  /**
   * 제출된 성찰 일지 데이터를 구글 스프레드시트로 실시간 전송
   * @param {object} record
   * @param {Array<object>} chatMessages - 철학자와 나눈 대화 전문 (선택)
   * @returns {Promise<boolean>}
   */
  async sendReflectionToSheet(record, chatMessages = []) {
    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) return false;

    const payload = {
      type: "reflection",
      timestamp: new Date(record.timestamp || Date.now()).toLocaleString("ko-KR"),
      gradeClassNum: record.gradeClassNum || "-",
      studentName: record.studentName || "게스트 학생",
      philosopher: record.philosopher || "-",
      r1: record.reflection?.r1 || "-",
      r2: record.reflection?.r2 || "-",
      r3: record.reflection?.r3 || "-",
      chatSummary: Array.isArray(chatMessages) && chatMessages.length > 0
        ? chatMessages
            .map((m) => `${m.role === "philo" ? record.philosopher : record.studentName}: ${m.text}`)
            .join("\n")
        : "",
    };

    try {
      // Google Apps Script 웹앱은 mode: 'no-cors'로 안전하게 전송
      await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[GoogleSheet] Successfully synced record to Google Sheet:", payload);
      return true;
    } catch (err) {
      console.warn("[GoogleSheet] Failed to send to Google Sheet", err);
      return false;
    }
  },
};
