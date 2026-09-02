import React, { useState, useEffect } from "react";
import { getSavedAiConfig, saveAiConfig } from "../../services/api";

/**
 * 브라우저 화면에서 바로 API 키를 설정할 수 있는 모달
 */
export function ApiKeyModal({ isOpen, onClose, onToast }) {
  const [provider, setProvider] = useState("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    if (isOpen) {
      const config = getSavedAiConfig();
      setProvider(config.provider || "gemini");
      setGeminiKey(config.geminiKey || "");
      setClaudeKey(config.claudeKey || "");
      setOpenaiKey(config.openaiKey || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiConfig({
      provider,
      geminiKey: geminiKey.trim(),
      claudeKey: claudeKey.trim(),
      openaiKey: openaiKey.trim(),
    });
    onToast?.("✓ AI API 설정이 저장되었습니다!");
    onClose();
  };

  const handleClear = () => {
    setGeminiKey("");
    setClaudeKey("");
    setOpenaiKey("");
    saveAiConfig({
      provider: "gemini",
      geminiKey: "",
      claudeKey: "",
      openaiKey: "",
    });
    onToast?.("✓ 설정이 초기화되었습니다.");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⚙️ 생성형 AI API 설정</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>
              대화용 AI 모델 및 API 키 설정
            </label>
            <div className="provider-tabs" style={{ marginTop: "6px" }}>
              <button
                className={`tab-btn ${provider === "gemini" ? "active" : ""}`}
                onClick={() => setProvider("gemini")}
              >
                🌟 Google Gemini (추천)
              </button>
              <button
                className={`tab-btn ${provider === "claude" ? "active" : ""}`}
                onClick={() => setProvider("claude")}
              >
                Claude
              </button>
              <button
                className={`tab-btn ${provider === "openai" ? "active" : ""}`}
                onClick={() => setProvider("openai")}
              >
                OpenAI
              </button>
            </div>

            {provider === "gemini" && (
              <div className="field-group" style={{ marginTop: "8px" }}>
                <label>Google Gemini API Key (AIzaSy...)</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
                <div className="field-tip">
                  👉 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>에서 1분 만에 무료 발급 가능합니다.
                </div>
              </div>
            )}

            {provider === "claude" && (
              <div className="field-group" style={{ marginTop: "8px" }}>
                <label>Anthropic Claude API Key (sk-ant-...)</label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                />
              </div>
            )}

            {provider === "openai" && (
              <div className="field-group" style={{ marginTop: "8px" }}>
                <label>OpenAI API Key (sk-...)</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-clear" onClick={handleClear}>
            초기화
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-cancel" onClick={onClose}>
              취소
            </button>
            <button className="btn-save" onClick={handleSave}>
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
