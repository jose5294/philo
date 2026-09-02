import React, { useState, useEffect } from "react";

/**
 * 모바일 접속 시 나타나는 PWA 앱 설치 유도 배너 컴포넌트
 */
export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. 이미 앱(Standalone 모드)으로 실행 중인지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      return; // 이미 앱으로 켜져 있으면 배너 숨김
    }

    // 2. 사용자가 이전에 배너를 닫았는지 확인 (세션 기준)
    const isDismissed = sessionStorage.getItem("PWA_INSTALL_DISMISSED");
    if (isDismissed) {
      return;
    }

    // 3. iOS (아이폰/아이패드 사파리) 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // iOS에서는 2초 후 가이드 배너 노출
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // 4. 안드로이드 / 크롬 / 엣지 beforeinstallprompt 이벤트 감지
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User installed the app");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("PWA_INSTALL_DISMISSED", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-icon">
        <span>§</span>
      </div>

      <div className="pwa-banner-content">
        <div className="pwa-banner-title">마음을 묻다 — 앱으로 이용하기</div>
        <div className="pwa-banner-desc">
          {isIos ? (
            <>
              하단의 <strong>공유(↑)</strong> 버튼 누른 뒤 <strong>'홈 화면에 추가'</strong>를 선택하면 진짜 앱으로 설치됩니다.
            </>
          ) : (
            "홈 화면에 앱을 설치하여 주소창 없이 빠르고 쾌적하게 대화해 보세요."
          )}
        </div>
      </div>

      <div className="pwa-banner-actions">
        {!isIos && deferredPrompt && (
          <button className="btn-pwa-install" onClick={handleInstallClick}>
            📲 앱 설치
          </button>
        )}
        <button className="btn-pwa-close" onClick={handleDismiss} title="닫기">
          ✕
        </button>
      </div>
    </div>
  );
}
