import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";

/**
 * 👤 학생 프로필 설정 및 계정 전환 모달
 */
export function UserProfileModal({ isOpen, onClose, onToast }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [name, setName] = useState("");
  const [gradeClassNum, setGradeClassNum] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);
  const [showTeacherPin, setShowTeacherPin] = useState(false);
  const [teacherPin, setTeacherPin] = useState("");

  useEffect(() => {
    if (isOpen) {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setName(user.isGuest ? "" : user.name || "");
      setGradeClassNum(user.isGuest ? "" : user.gradeClassNum || "");
      setRecentUsers(authService.getUserList());
      setShowTeacherPin(false);
      setTeacherPin("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    const user = authService.login(name, gradeClassNum);
    setCurrentUser(user);
    onToast?.(`✓ '${user.name}' 학생으로 프로필이 설정되었습니다.`);
    onClose();
  };

  const handleQuickSwitch = (u) => {
    const user = authService.login(u.name, u.gradeClassNum);
    setCurrentUser(user);
    onToast?.(`✓ '${user.name}' 학생으로 전환되었습니다.`);
    onClose();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(authService.getCurrentUser());
    setName("");
    setGradeClassNum("");
    onToast?.("✓ 게스트 모드로 전환되었습니다.");
    onClose();
  };

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    // 🔒 선생님 관리자 비밀번호: 5294
    if (teacherPin.trim() === "5294") {
      const user = authService.loginAsTeacher();
      setCurrentUser(user);
      onToast?.("👑 선생님(관리자) 모드로 전환되었습니다.");
      onClose();
    } else {
      alert("선생님 비밀번호(PIN)가 일치하지 않습니다.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            👤 학생 프로필 설정 & 계정 전환
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 현재 로그인 상태 */}
        <div className="current-user-banner">
          <div className="user-av">
            {currentUser.role === "teacher" ? "👑" : currentUser.isGuest ? "🌱" : "🎓"}
          </div>
          <div className="user-details">
            <div className="user-name">
              {currentUser.name}
              {currentUser.isGuest && <span className="guest-badge">게스트</span>}
              {currentUser.role === "teacher" && <span className="teacher-badge">교사용</span>}
            </div>
            <div className="user-sub">
              {currentUser.gradeClassNum || "학번/반 정보 없음 (대화 기록이 기기에 저장 중)"}
            </div>
          </div>
          {!currentUser.isGuest && (
            <button className="btn-logout-small" onClick={handleLogout} title="로그아웃">
              로그아웃
            </button>
          )}
        </div>

        {/* 프로필 입력 폼 */}
        <form className="profile-form" onSubmit={handleSaveStudent}>
          <div className="form-row-2">
            <div className="field-group">
              <label>학번 / 반 (선택)</label>
              <input
                type="text"
                placeholder="예: 2학년 3반 15번 (20315)"
                value={gradeClassNum}
                onChange={(e) => setGradeClassNum(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>학생 이름 (필수)</label>
              <input
                type="text"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="field-tip">
            💡 이름을 입력해 두면 대화 기록이 학생별로 분리되어 안전하게 저장되며, 성찰 일지 제출 시 이름이 자동 기재됩니다.
          </p>

          <button type="submit" className="btn-save full">
            학생 프로필 저장하기
          </button>
        </form>

        {/* 이 기기에서 접속했던 학생 목록 (빠른 전환) */}
        {recentUsers.length > 0 && (
          <div className="recent-users-section">
            <div className="recent-title">⚡ 이 기기에서 최근 접속한 학생 (빠른 전환)</div>
            <div className="recent-user-chips">
              {recentUsers.map((u) => (
                <button
                  key={u.id}
                  className={`user-chip ${u.id === currentUser.id ? "active" : ""}`}
                  onClick={() => handleQuickSwitch(u)}
                >
                  <span className="chip-name">{u.name}</span>
                  {u.gradeClassNum && <span className="chip-num">({u.gradeClassNum})</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선생님 모드 전환 영역 */}
        <div className="teacher-mode-section">
          {!showTeacherPin ? (
            <button
              className="btn-toggle-teacher"
              onClick={() => setShowTeacherPin(true)}
            >
              👑 선생님(관리자) 모드로 로그인하기
            </button>
          ) : (
            <form onSubmit={handleTeacherLogin} className="teacher-pin-form">
              <label>선생님 관리자 비밀번호(PIN) 입력</label>
              <div className="pin-input-row">
                <input
                  type="password"
                  placeholder="PIN 번호 입력"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn-teacher-submit">
                  입장
                </button>
                <button
                  type="button"
                  className="btn-teacher-cancel"
                  onClick={() => setShowTeacherPin(false)}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-tip">
            🔒 별도의 회원가입 없이 브라우저 내에서 안전하게 관리됩니다.
          </span>
          <button className="btn-cancel" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
