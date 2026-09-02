import React from "react";
import { ChatHeader } from "./ChatHeader";
import { InterlocutorSide } from "./InterlocutorSide";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { ReflectionSide } from "./ReflectionSide";
import { useChat } from "../../hooks/useChat";
import { useReflection } from "../../hooks/useReflection";

/**
 * 대화 화면 메인 컴포넌트
 * @param {{
 *   philosopher: import('../../data/philosophers').Philosopher,
 *   onBack: () => void,
 *   onOpenSettings: () => void,
 *   onOpenJournals: () => void,
 *   onOpenUsage: () => void,
 *   onOpenProfile: () => void,
 *   onToast: (msg: string) => void
 * }} props
 */
export function Chat({
  philosopher,
  onBack,
  onOpenSettings,
  onOpenJournals,
  onOpenUsage,
  onOpenProfile,
  onToast,
}) {
  const {
    messages,
    input,
    setInput,
    loading,
    scrollRef,
    sendMessage,
    resetChat,
    copyChat,
  } = useChat(philosopher, onToast);

  const {
    reflection,
    updateField,
    savedEntries,
    isSubmitting,
    submitReflection,
  } = useReflection(philosopher, onToast);

  return (
    <div>
      <ChatHeader
        philosopher={philosopher}
        onBack={onBack}
        onOpenSettings={onOpenSettings}
        onOpenJournals={onOpenJournals}
        onOpenUsage={onOpenUsage}
        onOpenProfile={onOpenProfile}
      />

      <div className="chat-shell">
        {/* 좌측 철학자 프로필 */}
        <InterlocutorSide philosopher={philosopher} />

        {/* 중앙 대화 메인 */}
        <main className="chat-main">
          <MessageList
            philosopher={philosopher}
            messages={messages}
            loading={loading}
            scrollRef={scrollRef}
            onSelectOpener={(openerText) => sendMessage(openerText)}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            loading={loading}
            onSend={() => sendMessage()}
            onReset={resetChat}
            onCopy={copyChat}
          />
        </main>

        {/* 우측 성찰 일지 */}
        <ReflectionSide
          reflection={reflection}
          onChangeField={updateField}
          savedEntries={savedEntries}
          isSubmitting={isSubmitting}
          onSubmit={submitReflection}
        />
      </div>
    </div>
  );
}
