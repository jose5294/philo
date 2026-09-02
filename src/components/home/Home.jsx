import React, { useState } from "react";
import { BrandHeader } from "../common/BrandHeader";
import { DailyBanner } from "./DailyBanner";
import { GuideSteps } from "./GuideSteps";
import { CrossRefList } from "./CrossRefList";
import { PhilosopherShelf } from "./PhilosopherShelf";
import { PHILOSOPHERS } from "../../data/philosophers";
import { DAILY_QUESTIONS, getInitialDailyIndex } from "../../data/dailyQuestions";

/**
 * 홈 화면 뷰
 * @param {{
 *   onSelect: (id: string) => void,
 *   onOpenSettings: () => void,
 *   onOpenJournals: () => void,
 *   onOpenUsage: () => void,
 *   onOpenProfile: () => void
 * }} props
 */
export function Home({
  onSelect,
  onOpenSettings,
  onOpenJournals,
  onOpenUsage,
  onOpenProfile,
}) {
  const [dailyIndex, setDailyIndex] = useState(getInitialDailyIndex);

  const handleCycleDailyQuestion = () => {
    setDailyIndex((prev) => (prev + 1) % DAILY_QUESTIONS.length);
  };

  return (
    <div>
      <BrandHeader
        onOpenSettings={onOpenSettings}
        onOpenJournals={onOpenJournals}
        onOpenUsage={onOpenUsage}
        onOpenProfile={onOpenProfile}
      />

      <DailyBanner
        question={DAILY_QUESTIONS[dailyIndex]}
        onCycle={handleCycleDailyQuestion}
      />

      <GuideSteps />

      <CrossRefList philosophers={PHILOSOPHERS} />

      <PhilosopherShelf
        philosophers={PHILOSOPHERS}
        onSelect={onSelect}
      />

      <footer className="site-foot">
        <span>© Ethics Studio · Middle School Moral Ed.</span>
        <span>철학자의 말이 무조건 정답은 아닙니다</span>
      </footer>
    </div>
  );
}
