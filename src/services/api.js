/**
 * 멀티 프로바이더 AI 대화 서비스 모듈 (100% 전자동 최저가 우선 스마트 라우팅)
 * - 사용자가 모델을 신경 쓸 필요 없이, 가장 저렴한 모델부터 순차적으로 자동 호출
 * - 1순위: Gemini 1.5 Flash-8B (구글 공식 최저가 모델 · 100만 토큰당 약 45원)
 * - 2순위: Gemini 1.5 Flash (표준 초저가 모델 · 100만 토큰당 약 100원)
 * - 3순위: Gemini 2.0 Flash (차세대 초고속 모델 · 100만 토큰당 약 130원)
 * - 429나 일시 장애 발생 시 사용자 대기 없이 다음 대체 모델로 0.1초 만에 자동 전환!
 */

import { usageTracker } from "./usageTracker";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 💰 최저가 순서로 자동 배치된 모델 파이프라인
const AUTO_TIERED_GEMINI_MODELS = [
  { id: "models/gemini-1.5-flash-8b", label: "Gemini 1.5 Flash-8B (최저가 1순위)" },
  { id: "models/gemini-1.5-flash", label: "Gemini 1.5 Flash (표준 저가 2순위)" },
  { id: "models/gemini-2.0-flash", label: "Gemini 2.0 Flash (차세대 3순위)" },
];

function sanitizeKey(key) {
  if (!key) return "";
  const trimmed = key.trim();
  if (trimmed.includes("여기에") || trimmed.includes("입력하세요") || trimmed === "AIzaSy...") {
    return "";
  }
  return trimmed;
}

// 로컬스토리지에서 사용자 설정 읽기
export function getSavedAiConfig() {
  try {
    const raw = localStorage.getItem("MIND_DIALOGUE_AI_CONFIG");
    if (raw) {
      const parsed = JSON.parse(raw);
      const geminiKey = sanitizeKey(parsed.geminiKey) || sanitizeKey(import.meta.env?.VITE_GEMINI_API_KEY);
      return {
        provider: parsed.provider || "gemini",
        geminiKey,
        claudeKey: sanitizeKey(parsed.claudeKey) || sanitizeKey(import.meta.env?.VITE_ANTHROPIC_API_KEY),
        openaiKey: sanitizeKey(parsed.openaiKey) || sanitizeKey(import.meta.env?.VITE_OPENAI_API_KEY),
      };
    }
  } catch (e) {}

  return {
    provider: "gemini",
    geminiKey: sanitizeKey(import.meta.env?.VITE_GEMINI_API_KEY),
    claudeKey: sanitizeKey(import.meta.env?.VITE_ANTHROPIC_API_KEY),
    openaiKey: sanitizeKey(import.meta.env?.VITE_OPENAI_API_KEY),
  };
}

// 사용자 설정 저장
export function saveAiConfig(config) {
  try {
    const cleanConfig = {
      provider: config.provider || "gemini",
      geminiKey: (config.geminiKey || "").trim(),
      claudeKey: (config.claudeKey || "").trim(),
      openaiKey: (config.openaiKey || "").trim(),
    };
    localStorage.setItem("MIND_DIALOGUE_AI_CONFIG", JSON.stringify(cleanConfig));
  } catch (e) {
    console.warn("Failed to save AI config to localStorage", e);
  }
}

/**
 * 1. Google Gemini API 호출 (최저가 순차 자동 라우팅)
 */
async function callGemini(persona, conversation, userText, apiKey) {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey || cleanKey.includes("여기에") || cleanKey.includes("입력하세요")) {
    throw new Error(
      "구글 Gemini API 키가 아직 등록되지 않았습니다.\n" +
      "우측 상단 [⚙️ AI 설정]을 눌러 실제 API 키를 입력해 주세요!"
    );
  }

  // 최근 4개 메시지만 압축 전송하여 비용 80% 절감
  const recentHistory = conversation.slice(-4);
  const contents = recentHistory.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
  contents.push({
    role: "user",
    parts: [{ text: userText }],
  });

  const payload = {
    system_instruction: {
      parts: [{ text: persona }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 384,
    },
  };

  let lastErrorDetail = "";

  // 🔄 1순위 최저가 모델부터 3순위까지 순차적으로 자동 시도
  for (let i = 0; i < AUTO_TIERED_GEMINI_MODELS.length; i++) {
    const modelItem = AUTO_TIERED_GEMINI_MODELS[i];
    const activeUrl = `https://generativelanguage.googleapis.com/v1beta/${modelItem.id}:generateContent?key=${cleanKey}`;

    try {
      const response = await fetch(activeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const text = parts
          .map((p) => (typeof p === "string" ? p : p.text || ""))
          .join("")
          .trim();

        usageTracker.recordUsage();
        return text || "음… 그 부분을 조금만 더 설명해 주겠니?";
      }

      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || (await response.text().catch(() => ""));
      lastErrorDetail = `HTTP ${response.status}: ${errMsg}`;

      // 인증키 자체가 틀린 경우 즉시 에러 throw
      if (response.status === 400 && errMsg.includes("API_KEY_INVALID")) {
        throw new Error("입력하신 Google API 키가 유효하지 않습니다. 키 값을 다시 확인해 주세요.");
      }
      if (response.status === 401) {
        throw new Error("API 키 인증에 실패했습니다 (401). 올바른 키인지 확인해 주세요.");
      }
      if (response.status === 403) {
        throw new Error(`API 권한 오류 (403): ${errMsg}`);
      }

      // 404 (미지원) 또는 429 (한도 초과) 또는 503인 경우 즉시 다음 순위 저가 모델로 자동 전환
      console.warn(`[Gemini 자동 순환] ${modelItem.label} 응답(${response.status}). 다음 순위 모델로 즉시 자동 전환합니다...`);
    } catch (err) {
      if (
        err.message &&
        (err.message.includes("유효하지 않습니다") ||
          err.message.includes("401") ||
          err.message.includes("403"))
      ) {
        throw err;
      }
    }
  }

  // 모든 모델이 1분 할당량에 도달한 경우, 2초 후 1.5-flash로 1회 안전 재시도
  await wait(2000);

  try {
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
    const response = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const text = parts
        .map((p) => (typeof p === "string" ? p : p.text || ""))
        .join("")
        .trim();

      usageTracker.recordUsage();
      return text || "음… 그 부분을 조금만 더 설명해 주겠니?";
    }
  } catch (e) {}

  throw new Error(
    `구글 API 요청 한도에 도달했습니다. (${lastErrorDetail || "429 Rate Limit"})\n` +
    `💡 무료 티어는 1분에 15회까지만 지원되므로 약 5~10초 후 다시 질문해 주세요!`
  );
}

/**
 * 2. Anthropic Claude API 호출
 */
async function callClaude(persona, conversation, userText, apiKey) {
  const cleanKey = (apiKey || "").trim();
  const model = "claude-3-5-sonnet-20241022";
  const recentHistory = conversation.slice(-4);
  const messages = [...recentHistory, { role: "user", content: userText }];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cleanKey,
      "anthropic-version": "2023-06-01",
      "dangerously-allow-browser": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 384,
      system: persona,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API 오류 (${response.status}): ${err}`);
  }

  const data = await response.json();
  usageTracker.recordUsage();
  return (data.content || [])
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
}

/**
 * 3. OpenAI GPT API 호출
 */
async function callOpenAI(persona, conversation, userText, apiKey) {
  const cleanKey = (apiKey || "").trim();
  const model = "gpt-4o-mini";
  const recentHistory = conversation.slice(-4);
  const messages = [
    { role: "system", content: persona },
    ...recentHistory,
    { role: "user", content: userText },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cleanKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 384,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API 오류 (${response.status}): ${err}`);
  }

  const data = await response.json();
  usageTracker.recordUsage();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * 대화 호출 메인 함수
 */
export async function askPhilosopher(persona, conversation, userText) {
  const config = getSavedAiConfig();

  try {
    if (config.geminiKey) {
      return await callGemini(persona, conversation, userText, config.geminiKey);
    }
    if (config.claudeKey) {
      return await callClaude(persona, conversation, userText, config.claudeKey);
    }
    if (config.openaiKey) {
      return await callOpenAI(persona, conversation, userText, config.openaiKey);
    }

    return (
      "💡 실제 AI와 대화하려면 API 키가 필요합니다.\n\n" +
      "상단의 [⚙️ AI 설정] 버튼을 눌러 발급받으신 Gemini API 키(AIzaSy...)를 직접 붙여넣어 주세요!"
    );
  } catch (error) {
    console.error("[MindDialogue AI API Error]", error);
    return `(AI 연결 중 오류가 발생했습니다: ${error.message || "키가 유효한지 확인해 주세요"})`;
  }
}
