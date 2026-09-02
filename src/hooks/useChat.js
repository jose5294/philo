import { useState, useRef, useEffect, useCallback } from "react";
import { askPhilosopher } from "../services/api";
import { authService } from "../services/authService";
import { chatStorage } from "../services/chatStorage";
import { generateSystemPrompt } from "../data/philosophers";

/**
 * 대화 상태 및 메시지 송수신 커스텀 훅 (대화 로그 자동 저장 및 복원 연동)
 * @param {import('../data/philosophers').Philosopher} philosopher
 * @param {(msg: string) => void} onToast
 */
export function useChat(philosopher, onToast) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());

  // 1. 저장된 대화 로그 불러오기 (없으면 첫 훅 멘트로 시작)
  const [messages, setMessages] = useState(() =>
    chatStorage.getChatHistory(currentUser.id, philosopher.id, philosopher.hook)
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // 사용자 변경 시 대화 로그 동기화
  useEffect(() => {
    const handleUserChange = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      setMessages(chatStorage.getChatHistory(user.id, philosopher.id, philosopher.hook));
    };

    window.addEventListener("mind_dialogue_user_changed", handleUserChange);
    return () => window.removeEventListener("mind_dialogue_user_changed", handleUserChange);
  }, [philosopher.id, philosopher.hook]);

  // 철학자가 바뀌면 해당 철학자와의 저장된 대화 복원
  useEffect(() => {
    const history = chatStorage.getChatHistory(currentUser.id, philosopher.id, philosopher.hook);
    setMessages(history);
  }, [philosopher.id, currentUser.id]);

  // 스크롤 자동 이동
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // 2. 메시지 전송 및 실시간 대화 로그 저장
  const sendMessage = useCallback(
    async (textToSend) => {
      const text = (textToSend || input).trim();
      if (!text || loading) return;

      const userMsg = { role: "user", text, timestamp: Date.now() };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      chatStorage.saveChatHistory(currentUser.id, philosopher.id, updatedMessages);
      setInput("");
      setLoading(true);

      try {
        // AI API용 히스토리 변환 (첫 hook 제외)
        const conversationHistory = updatedMessages.slice(1).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

        // 시스템 프롬프트(공통 지침 + 개별 페르소나) 생성
        const systemInstruction = generateSystemPrompt(philosopher);

        const reply = await askPhilosopher(
          systemInstruction,
          conversationHistory,
          text
        );

        const aiMsg = { role: "philo", text: reply, timestamp: Date.now() };
        const finalMessages = [...updatedMessages, aiMsg];

        setMessages(finalMessages);
        chatStorage.saveChatHistory(currentUser.id, philosopher.id, finalMessages);
      } catch (err) {
        console.error("[Chat Error]", err);
        const errorMsg = {
          role: "philo",
          text: `(대화 연결 중 오류가 발생했습니다: ${err.message || "잠시 후 다시 시도해 주세요"})`,
          timestamp: Date.now(),
        };
        const finalMessages = [...updatedMessages, errorMsg];
        setMessages(finalMessages);
        chatStorage.saveChatHistory(currentUser.id, philosopher.id, finalMessages);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, philosopher, currentUser.id]
  );

  // 3. 대화 초기화 (새 대화 시작)
  const resetChat = useCallback(() => {
    if (window.confirm("현재 철학자와의 대화를 초기화하고 새 대화를 시작할까요?")) {
      const fresh = chatStorage.clearChatHistory(
        currentUser.id,
        philosopher.id,
        philosopher.hook
      );
      setMessages(fresh);
      onToast?.("✓ 새로운 대화가 시작되었습니다.");
    }
  }, [philosopher.id, philosopher.hook, currentUser.id, onToast]);

  // 4. 대화 내용 텍스트 복사
  const copyChat = useCallback(() => {
    const text = messages
      .map((m) => `${m.role === "philo" ? philosopher.name : (currentUser.name || "나")}: ${m.text}`)
      .join("\n\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        onToast?.("✓ 대화 내용이 복사되었습니다.");
      });
    }
  }, [messages, philosopher.name, currentUser.name, onToast]);

  return {
    messages,
    input,
    setInput,
    loading,
    scrollRef,
    sendMessage,
    resetChat,
    copyChat,
  };
}
