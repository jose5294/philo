/**
 * 스토리지 어댑터 서비스
 * - 성찰 일지 저장 시 학생 정보(학번/반, 이름, 사용자 ID) 자동 포함
 * - 전체 성찰 일지 조회 및 엑셀(CSV) 다운로드 기능 제공
 */

import { authService } from "./authService";

const STORAGE_PREFIX = "mind_dialogue_reflection:";

export const storageService = {
  /**
   * 특정 철학자에 대한 성찰 일지 저장 (학생 정보 자동 첨부)
   * @param {string} philosopherId
   * @param {object} record
   * @returns {Promise<boolean>}
   */
  async saveReflection(philosopherId, record) {
    const user = authService.getCurrentUser();
    const timestamp = Date.now();
    const key = `${STORAGE_PREFIX}${user.id}:${philosopherId}:${timestamp}`;

    const enrichedRecord = {
      ...record,
      id: key,
      timestamp,
      userId: user.id,
      studentName: user.name || "게스트 학생",
      gradeClassNum: user.gradeClassNum || "",
      isGuest: user.isGuest || false,
    };

    const value = JSON.stringify(enrichedRecord);

    // 1. window.storage 지원 환경 시도
    if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
      try {
        await window.storage.set(key, value, false);
        return true;
      } catch (e) {
        console.warn("[Storage] window.storage.set failed, falling back to localStorage", e);
      }
    }

    // 2. 표준 localStorage 사용
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn("[Storage] localStorage is not available", e);
    }

    return false;
  },

  /**
   * 특정 철학자에 대한 지난 성찰 일지 최근 N건 불러오기
   * @param {string} philosopherId
   * @param {number} limit
   * @returns {Promise<Array<object>>}
   */
  async getReflections(philosopherId, limit = 5) {
    const all = await this.getAllReflections();
    const user = authService.getCurrentUser();

    // 현재 사용자의 일지 우선 필터링
    return all
      .filter(
        (item) =>
          (item.philosopherId === philosopherId || item.philosopher === philosopherId) &&
          (!item.userId || item.userId === user.id || user.role === "teacher")
      )
      .slice(0, limit);
  },

  /**
   * 모든 제출된 전체 성찰 일지 불러오기 (최신순)
   * @returns {Promise<Array<object>>}
   */
  async getAllReflections() {
    const items = [];

    // 1. window.storage 지원 환경 시도
    if (typeof window !== "undefined" && window.storage && typeof window.storage.list === "function") {
      try {
        const res = await window.storage.list(STORAGE_PREFIX, false);
        if (res && res.keys && res.keys.length) {
          for (const k of res.keys) {
            try {
              const r = await window.storage.get(k, false);
              if (r && r.value) {
                const parsed = JSON.parse(r.value);
                items.push({ ...parsed, storageKey: k });
              }
            } catch (err) {}
          }
        }
      } catch (e) {
        console.warn("[Storage] window.storage.list failed, fallback to localStorage", e);
      }
    }

    // 2. localStorage 검색
    if (items.length === 0 && typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              items.push({ ...parsed, storageKey: key });
            } catch (err) {}
          }
        }
      }
    }

    // 최신 작성일 기준 정렬
    items.sort((a, b) => {
      const timeA = new Date(a.time || a.timestamp || 0).getTime();
      const timeB = new Date(b.time || b.timestamp || 0).getTime();
      return timeB - timeA;
    });

    return items;
  },

  /**
   * 특정 일지 항목 삭제
   * @param {string} storageKey
   */
  async deleteReflection(storageKey) {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.delete === "function") {
      try {
        await window.storage.delete(storageKey, false);
      } catch (e) {}
    }
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(storageKey);
    }
    return true;
  },

  /**
   * 전체 성찰 일지 CSV (엑셀 호환) 다운로드 생성 (학번/반, 학생 이름 컬럼 포함)
   * @param {Array<object>} records
   */
  exportToCsv(records) {
    if (!records || records.length === 0) return;

    const headers = [
      "학번/반",
      "학생 이름",
      "작성일시",
      "대화한 철학자",
      "1. 내가 한 고민",
      "2. 철학자의 조언",
      "3. 나의 최종 판단",
    ];

    const rows = records.map((r) => {
      const studentNum = (r.gradeClassNum || "-").replace(/"/g, '""');
      const studentName = (r.studentName || "게스트").replace(/"/g, '""');
      const timeStr = r.time ? new Date(r.time).toLocaleString("ko-KR") : "";
      const philoStr = r.philosopher || "";
      const q1 = (r.reflection?.r1 || "").replace(/"/g, '""');
      const q2 = (r.reflection?.r2 || "").replace(/"/g, '""');
      const q3 = (r.reflection?.r3 || "").replace(/"/g, '""');
      return `"${studentNum}","${studentName}","${timeStr}","${philoStr}","${q1}","${q2}","${q3}"`;
    });

    // 한글 엑셀 깨짐 방지를 위한 UTF-8 BOM 추가 (\uFEFF)
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `도덕_성찰일지_제출명단_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
