import React, { useState, useEffect, useCallback } from "react";
import { Home } from "./components/home/Home";
import { Chat } from "./components/chat/Chat";
import { ApiKeyModal } from "./components/common/ApiKeyModal";
import { JournalArchiveModal } from "./components/common/JournalArchiveModal";
import { UsageModal } from "./components/common/UsageModal";
import { UserProfileModal } from "./components/common/UserProfileModal";
import { PwaInstallBanner } from "./components/common/PwaInstallBanner";
import { Toast } from "./components/common/Toast";
import { useToast } from "./hooks/useToast";
import { getPhilosopherById } from "./data/philosophers";

/**
 * 앱 최상위 루트 컴포넌트
 */
export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isJournalsOpen, setIsJournalsOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toastMessage, showToast } = useToast();

  const activePhilosopher = activeId ? getPhilosopherById(activeId) : null;

  // 1. 페이지 첫 로드 시 브라우저 기본 상태 초기화 및 해시(#) 확인
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && getPhilosopherById(hash)) {
      setScreen("chat");
      setActiveId(hash);
      window.history.replaceState({ screen: "chat", id: hash }, "", `#${hash}`);
    } else {
      window.history.replaceState({ screen: "home" }, "", " ");
    }

    // 2. 스마트폰 뒤로가기(popstate) 이벤트 핸들러
    const handlePopState = (event) => {
      const state = event.state;

      // 모달이 열려 있는 상태에서 뒤로가기를 누른 경우 모달만 닫기
      if (isSettingsOpen || isJournalsOpen || isUsageOpen || isProfileOpen) {
        setIsSettingsOpen(false);
        setIsJournalsOpen(false);
        setIsUsageOpen(false);
        setIsProfileOpen(false);
        return;
      }

      if (state && state.screen === "chat" && state.id) {
        setScreen("chat");
        setActiveId(state.id);
      } else {
        setScreen("home");
        setActiveId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSettingsOpen, isJournalsOpen, isUsageOpen, isProfileOpen]);

  // 철학자 선택 (히스토리에 기록 추가)
  const handleSelectPhilosopher = useCallback((id) => {
    setActiveId(id);
    setScreen("chat");
    window.history.pushState({ screen: "chat", id }, "", `#${id}`);
  }, []);

  // 상단 '← 다른 철학자 선택하기' 클릭 시
  const handleBackToHome = useCallback(() => {
    if (window.history.state && window.history.state.screen === "chat") {
      window.history.back();
    } else {
      setScreen("home");
      setActiveId(null);
      window.history.replaceState({ screen: "home" }, "", " ");
    }
  }, []);

  // 모달 열기 핸들러
  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
    window.history.pushState({ modal: "settings", screen, id: activeId }, "");
  }, [screen, activeId]);

  const handleOpenJournals = useCallback(() => {
    setIsJournalsOpen(true);
    window.history.pushState({ modal: "journals", screen, id: activeId }, "");
  }, [screen, activeId]);

  const handleOpenUsage = useCallback(() => {
    setIsUsageOpen(true);
    window.history.pushState({ modal: "usage", screen, id: activeId }, "");
  }, [screen, activeId]);

  const handleOpenProfile = useCallback(() => {
    setIsProfileOpen(true);
    window.history.pushState({ modal: "profile", screen, id: activeId }, "");
  }, [screen, activeId]);

  const handleCloseModals = useCallback(() => {
    setIsSettingsOpen(false);
    setIsJournalsOpen(false);
    setIsUsageOpen(false);
    setIsProfileOpen(false);
  }, []);

  return (
    <div className="mm-root">
      {screen === "home" && (
        <Home
          onSelect={handleSelectPhilosopher}
          onOpenSettings={handleOpenSettings}
          onOpenJournals={handleOpenJournals}
          onOpenUsage={handleOpenUsage}
          onOpenProfile={handleOpenProfile}
        />
      )}

      {screen === "chat" && activePhilosopher && (
        <Chat
          philosopher={activePhilosopher}
          onBack={handleBackToHome}
          onOpenSettings={handleOpenSettings}
          onOpenJournals={handleOpenJournals}
          onOpenUsage={handleOpenUsage}
          onOpenProfile={handleOpenProfile}
          onToast={showToast}
        />
      )}

      {/* 👤 학생 프로필 설정 및 계정 전환 모달 */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={handleCloseModals}
        onToast={showToast}
      />

      {/* ⚙️ AI 설정 모달 */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={handleCloseModals}
        onToast={showToast}
      />

      {/* 📚 나의 학습 기록 보관함 (성찰 일지 + 대화 로그 다시보기) */}
      <JournalArchiveModal
        isOpen={isJournalsOpen}
        onClose={handleCloseModals}
        onToast={showToast}
      />

      {/* 📊 AI 일일 사용량 및 실시간 한도 모달 */}
      <UsageModal
        isOpen={isUsageOpen}
        onClose={handleCloseModals}
        onToast={showToast}
      />

      {/* 📲 모바일 PWA 앱 설치 배너 */}
      <PwaInstallBanner />

      <Toast message={toastMessage} />
    </div>
  );
}
