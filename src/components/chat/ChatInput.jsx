import React from "react";

/**
 * 대화 입력창 및 하단 액션 툴바
 * @param {{
 *   input: string,
 *   setInput: (val: string) => void,
 *   loading: boolean,
 *   onSend: () => void,
 *   onReset: () => void,
 *   onCopy: () => void
 * }} props
 */
export function ChatInput({
  input,
  setInput,
  loading,
  onSend,
  onReset,
  onCopy,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input">
      <div className="input-row">
        <textarea
          rows={2}
          placeholder="고민이나 생각을 자유롭게 입력하세요… (Shift+Enter 줄바꿈)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-btn"
          disabled={loading || !input.trim()}
          onClick={() => onSend()}
        >
          전송 →
        </button>
      </div>

      <div className="input-tools">
        <div className="left">
          <button onClick={onReset} title="대화를 초기화합니다">
            🧹 대화 다시 시작
          </button>
          <button onClick={onCopy} title="전체 대화 내용을 텍스트로 복사합니다">
            📄 대화 복사
          </button>
        </div>
        <div className="hint">Shift+Enter 줄바꿈</div>
      </div>
    </div>
  );
}
