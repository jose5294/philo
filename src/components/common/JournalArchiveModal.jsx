import React, { useState, useEffect } from "react";
import { storageService } from "../../services/storage";
import { chatStorage } from "../../services/chatStorage";
import { authService } from "../../services/authService";
import { PHILOSOPHERS, getPhilosopherById } from "../../data/philosophers";

/**
 * 📚 학습 기록 보관함 모달 (성찰 일지 + 지난 대화 로그 전문 다시보기)
 */
export function JournalArchiveModal({ isOpen, onClose, onToast }) {
  const [activeTab, setActiveTab] = useState("journals"); // 'journals' | 'chats'
  const [journals, setJournals] = useState([]);
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [filterPhilo, setFilterPhilo] = useState("all");
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. 성찰 일지 로드
      const records = await storageService.getAllReflections();
      setJournals(records);

      // 2. 대화 로그 로드
      const chats = chatStorage.getAllUserChats(currentUser.id);
      setChatHistories(chats);
      if (chats.length > 0 && !selectedChat) {
        setSelectedChat(chats[0]);
      }
    } catch (e) {
      console.error("Failed to load records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  // 성찰 일지 필터링 (선생님 모드면 전체, 학생 모드면 본인 것 우선 또는 전체)
  const filteredJournals =
    filterPhilo === "all"
      ? journals
      : journals.filter(
          (j) => j.philosopher === filterPhilo || j.philosopherId === filterPhilo
        );

  const handleDeleteJournal = async (storageKey) => {
    if (window.confirm("이 성찰 일지 항목을 삭제하시겠습니까?")) {
      await storageService.deleteReflection(storageKey);
      setJournals((prev) => prev.filter((item) => item.storageKey !== storageKey));
      onToast?.("✓ 일지가 삭제되었습니다.");
    }
  };

  const handleExportCsv = () => {
    if (filteredJournals.length === 0) {
      onToast?.("다운로드할 성찰 일지가 없습니다.");
      return;
    }
    storageService.exportToCsv(filteredJournals);
    onToast?.("✓ 엑셀(CSV) 파일로 다운로드되었습니다!");
  };

  const handleCopyJournals = () => {
    if (filteredJournals.length === 0) {
      onToast?.("복사할 성찰 일지가 없습니다.");
      return;
    }

    const text = filteredJournals
      .map(
        (j, i) =>
          `[${i + 1}. ${j.studentName || "학생"} (${j.gradeClassNum || "-"}) - ${j.philosopher}과의 대화]\n` +
          `작성일시: ${new Date(j.time).toLocaleString("ko-KR")}\n` +
          `1) 내가 한 고민: ${j.reflection?.r1 || ""}\n` +
          `2) 철학자의 조언: ${j.reflection?.r2 || ""}\n` +
          `3) 나의 최종 판단: ${j.reflection?.r3 || ""}\n`
      )
      .join("\n------------------------------------\n\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onToast?.("✓ 전체 성찰 일지 내용이 복사되었습니다.");
      });
    }
  };

  const handleCopyCurrentChat = () => {
    if (!selectedChat || !selectedChat.messages) return;
    const philo = getPhilosopherById(selectedChat.philosopherId);
    const philoName = philo ? philo.name : "철학자";

    const text = selectedChat.messages
      .map((m) => `${m.role === "philo" ? philoName : (currentUser.name || "학생")}: ${m.text}`)
      .join("\n\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onToast?.("✓ 대화 전문이 복사되었습니다.");
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content journal-modal large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            📚 나의 학습 기록 보관함
            {currentUser.role === "teacher" && <span className="admin-pill">👑 교사용 전체보기</span>}
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 상단 탭 전환 */}
        <div className="archive-tab-bar">
          <button
            className={`archive-tab-btn ${activeTab === "journals" ? "active" : ""}`}
            onClick={() => setActiveTab("journals")}
          >
            📑 제출한 성찰 일지 ({journals.length}건)
          </button>
          <button
            className={`archive-tab-btn ${activeTab === "chats" ? "active" : ""}`}
            onClick={() => setActiveTab("chats")}
          >
            💬 지난 대화 기록 다시보기 ({chatHistories.length}명)
          </button>
        </div>

        {/* 탭 1: 성찰 일지 모음 */}
        {activeTab === "journals" && (
          <>
            <div className="journal-toolbar">
              <div className="filter-group">
                <label>사상가별 보기:</label>
                <select
                  value={filterPhilo}
                  onChange={(e) => setFilterPhilo(e.target.value)}
                >
                  <option value="all">전체 사상가 ({journals.length})</option>
                  {PHILOSOPHERS.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="action-group">
                <button className="btn-journal-action" onClick={handleCopyJournals}>
                  📄 전체 복사
                </button>
                <button className="btn-journal-action primary" onClick={handleExportCsv}>
                  📥 엑셀(CSV) 다운로드
                </button>
              </div>
            </div>

            <div className="journal-list-body">
              {loading && <div className="journal-empty">일지를 불러오는 중...</div>}

              {!loading && filteredJournals.length === 0 && (
                <div className="journal-empty">
                  아직 제출된 성찰 일지가 없습니다.<br />
                  철학자와 대화 후 우측 <strong>[성찰 일지]</strong>를 작성하여 제출하면 이곳에 기록됩니다!
                </div>
              )}

              {!loading &&
                filteredJournals.map((entry, idx) => {
                  const timeStr = entry.time
                    ? new Date(entry.time).toLocaleString("ko-KR")
                    : "";
                  return (
                    <div className="journal-card" key={entry.storageKey || idx}>
                      <div className="journal-card-header">
                        <div className="philo-badge">
                          <span>🏛️</span> {entry.philosopher}
                        </div>
                        <div className="student-badge-tag">
                          👤 {entry.studentName || "게스트"}
                          {entry.gradeClassNum && ` (${entry.gradeClassNum})`}
                        </div>
                        <div className="journal-date">{timeStr}</div>
                        <button
                          className="btn-delete-item"
                          title="삭제"
                          onClick={() => handleDeleteJournal(entry.storageKey)}
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="journal-card-body">
                        <div className="journal-field">
                          <span className="q-tag">1. 내가 한 고민</span>
                          <p className="q-val">{entry.reflection?.r1 || "-"}</p>
                        </div>
                        <div className="journal-field">
                          <span className="q-tag">2. 철학자의 조언</span>
                          <p className="q-val">{entry.reflection?.r2 || "-"}</p>
                        </div>
                        <div className="journal-field">
                          <span className="q-tag">3. 나의 최종 판단</span>
                          <p className="q-val highlight">{entry.reflection?.r3 || "-"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}

        {/* 탭 2: 지난 대화 로그 다시보기 */}
        {activeTab === "chats" && (
          <div className="chat-archive-layout">
            {/* 좌측: 사상가별 대화 목록 */}
            <div className="chat-archive-sidebar">
              <div className="sidebar-label">대화한 사상가 목록</div>
              {chatHistories.length === 0 ? (
                <div className="chat-empty-side">아직 저장된 대화가 없습니다.</div>
              ) : (
                chatHistories.map((c) => {
                  const philo = getPhilosopherById(c.philosopherId);
                  const name = philo ? philo.name : c.philosopherId;
                  const isSelected = selectedChat?.philosopherId === c.philosopherId;
                  return (
                    <button
                      key={c.philosopherId}
                      className={`chat-archive-item ${isSelected ? "active" : ""}`}
                      onClick={() => setSelectedChat(c)}
                    >
                      <div className="c-name">🏛️ {name}</div>
                      <div className="c-count">{c.messageCount}개의 대화 메시지</div>
                    </button>
                  );
                })
              )}
            </div>

            {/* 우측: 대화 전문 뷰어 */}
            <div className="chat-archive-viewer">
              {selectedChat ? (
                <>
                  <div className="viewer-header">
                    <div className="v-title">
                      🏛️ {getPhilosopherById(selectedChat.philosopherId)?.name || selectedChat.philosopherId} 와의 대화록
                    </div>
                    <button className="btn-journal-action" onClick={handleCopyCurrentChat}>
                      📄 대화 전문 복사
                    </button>
                  </div>

                  <div className="viewer-messages">
                    {selectedChat.messages.map((m, idx) => {
                      const isPhilo = m.role === "philo";
                      const philo = getPhilosopherById(selectedChat.philosopherId);
                      return (
                        <div
                          key={idx}
                          className={`viewer-msg ${isPhilo ? "philo" : "user"}`}
                        >
                          <div className="v-sender">
                            {isPhilo ? (philo?.name || "사상가") : (currentUser.name || "나")}
                          </div>
                          <div className="v-bubble">{m.text}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="journal-empty">사상가를 선택하면 나눈 대화 전문을 보실 수 있습니다.</div>
              )}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <div className="journal-note">
            💡 대화 기록과 성찰 일지는 현재 로그인된 학생 프로필(<strong>{currentUser.name}</strong>)에 안전하게 저장 중입니다.
          </div>
          <button className="btn-cancel" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
