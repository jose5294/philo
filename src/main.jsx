import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

// 🚀 기존 캐시 및 구버전 Service Worker 자동 정리 (하얀 화면 방지)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      // 캐시 충돌 방지를 위해 이전 버전 워커 정리
      registration.update().catch(() => {});
    }
  }).catch(() => {});
}

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("[Fatal Mount Error]", err);
    rootElement.innerHTML = `
      <div style="padding: 30px; text-align: center; font-family: sans-serif;">
        <h2>사이트를 불러오는 중입니다...</h2>
        <p>화면이 나오지 않을 경우 키보드의 <strong>Ctrl + Shift + R</strong> 또는 <strong>F5</strong>를 눌러 새로고침해 주세요.</p>
      </div>
    `;
  }
}
