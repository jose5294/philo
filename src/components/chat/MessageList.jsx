import React, { useState } from "react";

/**
 * 대화 메시지 목록 및 추천 오프너 컴포넌트
 * @param {{
 *   philosopher: import('../../data/philosophers').Philosopher,
 *   messages: Array<{ role: string, text: string }>,
 *   loading: boolean,
 *   scrollRef: React.RefObject<HTMLDivElement>,
 *   onSelectOpener: (text: string) => void
 * }} props
 */
export function MessageList({
  philosopher,
  messages,
  loading,
  scrollRef,
  onSelectOpener,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="chat-scroll" ref={scrollRef}>
      {/* 추천 질문 태그 */}
      <div className="quick-tags">
        <div className="qt-label">
          Suggested openers · 아직 무슨 말을 꺼낼지 모른다면
        </div>
        {philosopher.openers.map((opener, i) => (
          <button
            key={i}
            disabled={loading}
            onClick={() => onSelectOpener(opener)}
          >
            {opener}
          </button>
        ))}
      </div>

      {/* 메시지 히스토리 */}
      {messages.map((m, i) => {
        const isPhilo = m.role === "philo";
        return (
          <div
            className={`msg ${isPhilo ? "philo" : "user"}`}
            key={i}
          >
            <div
              className="av"
              style={isPhilo ? { color: philosopher.color } : {}}
            >
              {isPhilo ? (
                philosopher.image && !imgError ? (
                  <img
                    src={philosopher.image}
                    alt={philosopher.name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  philosopher.monogram
                )
              ) : (
                "나"
              )}
            </div>
            <div className="meta-wrap">
              <div className="meta">
                {isPhilo ? philosopher.name : "학생"}
              </div>
              <div className="bubble">{m.text}</div>
            </div>
          </div>
        );
      })}

      {/* 타이핑 인디케이터 */}
      {loading && (
        <div className="msg philo">
          <div className="av" style={{ color: philosopher.color }}>
            {philosopher.image && !imgError ? (
              <img
                src={philosopher.image}
                alt={philosopher.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setImgError(true)}
              />
            ) : (
              philosopher.monogram
            )}
          </div>
          <div className="meta-wrap">
            <div className="meta">{philosopher.name}</div>
            <div className="bubble">
              <span className="typing">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
