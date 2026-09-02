import React, { useState } from "react";

/**
 * 개별 철학자 책장 카드
 * @param {{
 *   philosopher: import('../../data/philosophers').Philosopher,
 *   index: number,
 *   onSelect: (id: string) => void
 * }} props
 */
export function ShelfCard({ philosopher, index, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const eraCategory = philosopher.era.split("·")[0].trim();

  return (
    <article
      className="shelf-card"
      onClick={() => onSelect(philosopher.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(philosopher.id);
        }
      }}
    >
      <div className="tag-row">
        <span className="catalog-tag">{philosopher.catalog}</span>
        <span className="catalog-tag">{eraCategory}</span>
      </div>
      <div>
        <div className="avatar">
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
        <div className="name">{philosopher.name}</div>
        <div className="name-sub">{philosopher.nameSub}</div>
        <div className="quote">"{philosopher.quote}"</div>
      </div>
      <button className="cta-full">대화 시작 →</button>
    </article>
  );
}
