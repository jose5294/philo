import React from "react";

/**
 * 우측 성찰 일지 작성 및 저장 목록 사이드바
 * @param {{
 *   reflection: { r1: string, r2: string, r3: string },
 *   onChangeField: (field: 'r1' | 'r2' | 'r3', value: string) => void,
 *   savedEntries: Array<object>,
 *   isSubmitting: boolean,
 *   onSubmit: () => void
 * }} props
 */
export function ReflectionSide({
  reflection,
  onChangeField,
  savedEntries,
  isSubmitting,
  onSubmit,
}) {
  return (
    <aside className="chat-side right">
      <div className="reflect">
        <h4>Reflection · 성찰 일지</h4>
        <div className="sub">
          대화가 어느 정도 진행되면, 아래 세 칸을 채워 활동지를 완성하세요.
        </div>

        <div className="reflect-field">
          <label>1. 내가 한 고민</label>
          <div className="field-hint">
            어떤 상황이었고, 무엇 때문에 갈등했나요?
          </div>
          <textarea
            value={reflection.r1}
            onChange={(e) => onChangeField("r1", e.target.value)}
            placeholder="예) 친구의 거짓말을 감싸줘야 할지 말지…"
          />
        </div>

        <div className="reflect-field">
          <label>2. 철학자의 조언</label>
          <div className="field-hint">
            대화에서 인상 깊었던 관점·질문을 요약해 보세요.
          </div>
          <textarea
            value={reflection.r2}
            onChange={(e) => onChangeField("r2", e.target.value)}
            placeholder="예) 거짓말이 보편적 법칙이 될 수 없다고 함…"
          />
        </div>

        <div className="reflect-field">
          <label>3. 나의 최종 판단</label>
          <div className="field-hint">
            그래서 나는 어떻게 하기로 결정했나요?
          </div>
          <textarea
            value={reflection.r3}
            onChange={(e) => onChangeField("r3", e.target.value)}
            placeholder="예) 난처하지만 친구에게 사실대로 말하자고 설득하겠다…"
          />
        </div>

        <button
          className="reflect-submit"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "성찰 일지 제출하기"}
        </button>

        <div className="reflect-note">
          제출한 일지는 이 브라우저에 안전하게 저장되며, 나중에 다시 열어볼 수 있습니다.
        </div>

        {savedEntries && savedEntries.length > 0 && (
          <div className="saved-list">
            <h4>지난 성찰 (최근 {savedEntries.length}건)</h4>
            {savedEntries.map((entry, i) => (
              <div className="saved-item" key={i}>
                <div className="t">
                  {new Date(entry.time).toLocaleString("ko-KR")}
                </div>
                <div>{entry.reflection?.r3 || ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
