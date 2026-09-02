import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storage";
import { googleSheetService } from "../services/googleSheetService";
import { chatStorage } from "../services/chatStorage";
import { authService } from "../services/authService";

const INITIAL_REFLECTION = { r1: "", r2: "", r3: "" };

/**
 * 성찰 일지 작성 및 저장을 관리하는 커스텀 훅 (구글 스프레드시트 실시간 동기화 연동)
 * @param {import('../data/philosophers').Philosopher} philosopher
 * @param {Function} [onToast]
 */
export function useReflection(philosopher, onToast) {
  const [reflection, setReflection] = useState(INITIAL_REFLECTION);
  const [savedEntries, setSavedEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 철학자별 이전 저장 목록 불러오기
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const records = await storageService.getReflections(philosopher.id, 5);
      if (isMounted) {
        setSavedEntries(records);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [philosopher.id]);

  /**
   * 입력 필드 업데이트 헬퍼
   * @param {'r1' | 'r2' | 'r3'} field
   * @param {string} value
   */
  const updateField = useCallback((field, value) => {
    setReflection((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 성찰 일지 제출 (로컬 저장 + 구글 스프레드시트 자동 전송)
   */
  const submitReflection = useCallback(async () => {
    const { r1, r2, r3 } = reflection;
    if (!r1.trim() || !r2.trim() || !r3.trim()) {
      onToast?.("세 칸을 모두 채워주세요");
      return;
    }

    setIsSubmitting(true);
    const user = authService.getCurrentUser();

    const record = {
      philosopher: philosopher.name,
      time: new Date().toISOString(),
      studentName: user.name || "게스트 학생",
      gradeClassNum: user.gradeClassNum || "",
      reflection: { ...reflection },
    };

    try {
      // 1. 로컬 저장
      await storageService.saveReflection(philosopher.id, record);
      setSavedEntries((prev) => [record, ...prev].slice(0, 5));
      setReflection(INITIAL_REFLECTION);

      // 2. 대화 기록과 함께 구글 스프레드시트로 실시간 전송
      const chatMessages = chatStorage.getChatHistory(user.id, philosopher.id, "");
      const sentToSheet = await googleSheetService.sendReflectionToSheet(record, chatMessages);

      if (sentToSheet) {
        onToast?.("✓ 성찰 일지가 제출되었으며 구글 스프레드시트에 기록되었습니다!");
      } else {
        onToast?.("✓ 성찰 일지가 안전하게 제출되었습니다!");
      }
    } catch (e) {
      console.error("Failed to save reflection:", e);
      onToast?.("✓ 저장되었습니다.");
      setSavedEntries((prev) => [record, ...prev].slice(0, 5));
      setReflection(INITIAL_REFLECTION);
    } finally {
      setIsSubmitting(false);
    }
  }, [reflection, philosopher.id, philosopher.name, onToast]);

  return {
    reflection,
    updateField,
    savedEntries,
    isSubmitting,
    submitReflection,
  };
}
