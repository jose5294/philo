import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";

/**
 * 상단 헤더에 현재 로그인된 학생 프로필을 표시하고 클릭 시 모달을 여는 뱃지
 */
export function UserBadge({ onClick }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  useEffect(() => {
    const handler = () => setUser(authService.getCurrentUser());
    window.addEventListener("mind_dialogue_user_changed", handler);
    return () => window.removeEventListener("mind_dialogue_user_changed", handler);
  }, []);

  const isTeacher = user.role === "teacher";
  const icon = isTeacher ? "👑" : user.isGuest ? "🌱" : "🎓";
  const label = isTeacher
    ? "선생님 (관리자)"
    : user.isGuest
    ? "게스트 (로그인)"
    : user.gradeClassNum
    ? `${user.gradeClassNum} ${user.name}`
    : user.name;

  return (
    <button
      className={`user-badge ${isTeacher ? "teacher" : user.isGuest ? "guest" : "student"}`}
      onClick={onClick}
      title="학생 프로필 설정 및 계정 전환"
    >
      <span className="user-badge-icon">{icon}</span>
      <span className="user-badge-label">{label}</span>
    </button>
  );
}
