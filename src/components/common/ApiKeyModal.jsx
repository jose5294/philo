import React, { useState, useEffect } from "react";
import { getSavedAiConfig, saveAiConfig, GEMINI_MODELS_POOL } from "../../services/api";

/**
 * 브라우저 화면에서 바로 API 키 및 저렴한 모델을 선택할 수 있는 모달
 */
export function ApiKeyModal({ isOpen, onClose, onToast }) {
  const [provider, setProvider] = useState("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [model, setModel] = useState("models/gemini-1.5-flash-8b");

  useEffect(() => {
    if (isOpen) {
      const config = getSavedAiConfig();
      setProvider(config.provider || "gemini");
      setGeminiKey(config.geminiKey || "");
      setClaudeKey(config.claudeKey || "");
      setOpenaiKey(config.openaiKey || "");
      setModel(config.model || "models/gemini-1.5-flash-8b");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAiConfig({
      provider,
      geminiKey: geminiKey.trim(),
      claudeKey: claudeKey.trim(),
      openaiKey: openaiKey.trim(),
      model: model.trim(),
    });
    onToast?.("✓ AI 모델 및 설정이 성공적으로 저장되었습니다!");
    onClose();
  };

  const handleClear = () => {
    setGeminiKey("");
    setClaudeKey("");
    setOpenaiKey("");
    setModel("models/gemini-1.5-flash-8b");
    saveAiConfig({
      provider: "gemini",
      geminiKey: "",
      claudeKey: "",
      openaiKey: "",
      model: "models/gemini-1.5-flash-8b",
    });
    onToast?.("✓ 설정이 초기화되었습니다.");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">⚙️ 생성형 AI 모델 및 API 설정</div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>
              대화용 AI 엔진 선택
            </label>
            <div className="provider-tabs" style={{ marginTop: "6px" }}>
              <button
                className={`tab-btn ${provider === "gemini" ? "active" : ""}`}
                onClick={() => setProvider("gemini")}
              >
                🌟 Google Gemini (초저가 추천)
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
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <div className="field-group">
                  <label style={{ fontWeight: "600", fontSize: "13px" }}>
                    🎯 사용할 Gemini 모델 선택 (단가별)
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1.5px solid var(--ink)",
                      borderRadius: "4px",
                      background: "var(--paper)",
                      fontSize: "13.5px",
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                      marginTop: "4px"
                    }}
                  >
                    {GEMINI_MODELS_POOL.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="field-tip" style={{ color: "var(--accent)", fontWeight: "500", marginTop: "4px" }}>
                    💡 <strong>1.5 Flash-8B</strong>는 구글의 공식 초경량 모델로 <strong>100만 토큰당 약 45원</strong>(커피 한 잔 값의 1/100)으로 가장 저렴합니다.
                  </div>
                </div>

                <div className="field-group">
                  <label>Google Gemini API Key (AIzaSy...)</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                  />
                  <div className="field-tip">
                    👉 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">Google AI Studio</a>에서 발급받은 키를 붙여넣으세요.
                  </div>
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

        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
          <button className="btn-secondary" onClick={handleClear} style={{ fontSize: "12px", color: "var(--ink-3)" }}>
            설정 초기화
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button className="btn-primary" onClick={handleSave}>
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
