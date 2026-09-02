import React, { useState } from "react";

/**
 * 좌측 철학자 프로필 및 레퍼런스 사이드바
 * @param {{ philosopher: import('../../data/philosophers').Philosopher }} props
 */
export function InterlocutorSide({ philosopher }) {
  const [imgError, setImgError] = useState(false);

  return (
    <aside className="chat-side left">
      <h4>Interlocutor</h4>
      <div className="side-avatar">
        {philosopher.image && !imgError ? (
          <img
            src={philosopher.image}
            alt={philosopher.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="mono" style={{ color: philosopher.color }}>
            {philosopher.monogram}
          </span>
        )}
      </div>
      <div className="side-name">{philosopher.name}</div>
      <div className="side-name-sub">{philosopher.nameSub}</div>
      <div className="side-quote">"{philosopher.quote}"</div>
      <div className="side-about">{philosopher.about}</div>

      <h4>Reference</h4>
      <div className="side-meta">
        <div className="row">
          <span className="k">시대</span>
          <span>{philosopher.era}</span>
        </div>
        <div className="row">
          <span className="k">학파</span>
          <span>{philosopher.school}</span>
        </div>
        <div className="row">
          <span className="k">키워드</span>
          <span>{philosopher.keywords.join("  ")}</span>
        </div>
        <div className="row">
          <span className="k">유용한 때</span>
          <span>{philosopher.strength}</span>
        </div>
      </div>
    </aside>
  );
}
