import React from "react";
import { ShelfCard } from "./ShelfCard";

/**
 * 철학자 10인 그리드 배치 섹션 (5명씩 2줄)
 * @param {{
 *   philosophers: import('../../data/philosophers').Philosopher[],
 *   onSelect: (id: string) => void
 * }} props
 */
export function PhilosopherShelf({ philosophers, onSelect }) {
  return (
    <section className="shelf-section">
      <div className="shelf-header">
        <h2 className="shelf-title">
          {philosophers.length}인의 사상가, 당신의 사상가를 선택하세요
        </h2>
        <div className="shelf-note">
          마음이 가는 사상가를 클릭하여 깊이 있는 대화를 시작해 보세요
        </div>
      </div>

      <div className="shelf-wrap">
        <div className="shelf-grid">
          {philosophers.map((p, i) => (
            <ShelfCard
              key={p.id}
              philosopher={p}
              index={i}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
