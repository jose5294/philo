import React, { useState } from "react";

/**
 * 고민별 철학자 요약 크로스 레퍼런스 리스트
 * 철학자의 작은 썸네일 사진과 함께 표시됩니다.
 * @param {{ philosophers: import('../../data/philosophers').Philosopher[] }} props
 */
export function CrossRefList({ philosophers }) {
  return (
    <div className="cross-ref">
      {philosophers.map((p) => (
        <CrossRefItem key={p.id} philosopher={p} />
      ))}
    </div>
  );
}

function CrossRefItem({ philosopher }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="item">
      <div className="mini-thumb-wrap">
        {philosopher.image && !imgError ? (
          <img
            src={philosopher.image}
            alt={philosopher.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
            className="cross-ref-thumb"
          />
        ) : (
          <span
            className="cross-ref-mono"
            style={{ color: philosopher.color }}
          >
            {philosopher.monogram}
          </span>
        )}
      </div>
      <b className="cross-ref-name">{philosopher.name}</b>
      <span className="cross-ref-strength">— {philosopher.strength}</span>
    </div>
  );
}
