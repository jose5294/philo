/**
 * 학생/사용자 간편 계정 및 프로필 관리 서비스
 * - 학번/반/이름 기반의 간편 프로필 (별도 비밀번호 없이 1초 로그인/전환)
 * - 공용 PC에서 여러 학생의 기록이 섞이지 않도록 사용자별 데이터 격리 지원
 */

const USER_STORAGE_KEY = "mind_dialogue_current_user";
const USER_LIST_KEY = "mind_dialogue_user_history";

export const authService = {
  /**
   * 현재 로그인된 사용자 정보 조회 (없으면 기본 게스트 사용자 반환)
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // 기본 게스트 프로필
    return {
      id: "guest",
      name: "게스트 학생",
      gradeClassNum: "",
      isGuest: true,
      role: "student", // 'student' | 'teacher'
    };
  },

  /**
   * 학생 프로필 저장 및 로그인
   * @param {string} name - 학생 이름 (예: 홍길동)
   * @param {string} gradeClassNum - 학번/반 (예: 2학년 3반 15번 또는 20315)
   */
  login(name, gradeClassNum = "") {
    const cleanName = (name || "").trim() || "익명 학생";
    const cleanNum = (gradeClassNum || "").trim();
    const id = cleanNum ? `${cleanNum}_${cleanName}` : `user_${cleanName}_${Date.now()}`;

    const user = {
      id,
      name: cleanName,
      gradeClassNum: cleanNum,
      isGuest: false,
      role: "student",
      lastLogin: Date.now(),
    };

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // 과거 로그인했던 프로필 목록에 추가 (빠른 계정 전환용)
      const list = this.getUserList();
      const filtered = list.filter((u) => u.id !== user.id);
      filtered.unshift(user);
      localStorage.setItem(USER_LIST_KEY, JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      console.warn("[Auth] Failed to save user", e);
    }

    this.notifyChange();
    return user;
  },

  /**
   * 교사(관리자) 모드로 전환
   */
  loginAsTeacher() {
    const user = {
      id: "teacher_admin",
      name: "선생님 (관리자)",
      gradeClassNum: "지도교사",
      isGuest: false,
      role: "teacher",
      lastLogin: Date.now(),
    };
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {}
    this.notifyChange();
    return user;
  },

  /**
   * 로그아웃 (게스트 모드로 전환)
   */
  logout() {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {}
    this.notifyChange();
  },

  /**
   * 이 기기에서 접속했던 학생 프로필 목록 (빠른 전환용)
   */
  getUserList() {
    try {
      const raw = localStorage.getItem(USER_LIST_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  },

  notifyChange() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mind_dialogue_user_changed"));
    }
  },
};
