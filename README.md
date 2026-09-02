# 마음을 묻다 — 중학 도덕 철학 상담소 (Mind Dialogue)

철학자와 대화하며 도덕적 고민을 탐색하고 성찰 일지를 작성할 수 있는 웹 애플리케이션입니다.

---

## 📁 수정 및 확장이 용이한 프로젝트 구조

```text
mind-dialogue/
├── src/
│   ├── data/
│   │   ├── philosophers.js       # 👤 철학자 8인 데이터, 프롬프트, 키워드, 추천 오프너 (철학자 추가/수정 시 여기만 변경)
│   │   └── dailyQuestions.js     # ❓ 오늘의 질문 목록
│   ├── services/
│   │   ├── api.js                # 🤖 AI API 연동부 (API Key 없을 때도 동작하는 Mock 모드 내장)
│   │   └── storage.js            # 💾 성찰 일지 저장소 어댑터 (window.storage & localStorage 지원)
│   ├── hooks/
│   │   ├── useChat.js            # 💬 대화 상태, 메시지 전송, 초기화, 복사 로직
│   │   ├── useReflection.js      # 📝 성찰 일지 입력값 및 저장/불러오기 로직
│   │   └── useToast.js           # 🔔 토스트 알림 로직
│   ├── components/
│   │   ├── common/               # 헤더, 토스트 등 공통 UI
│   │   ├── home/                 # 홈 화면 구성 컴포넌트들 (배너, 가이드, 책장 카드 등)
│   │   └── chat/                 # 채팅 화면 구성 컴포넌트들 (사이드바, 메시지창, 일지 등)
│   ├── styles/
│   │   ├── theme.css             # 🎨 색상(종이/서고 톤), 폰트 등 테마 CSS 변수
│   │   └── index.css             # 글로벌 스타일 진입점
│   ├── App.jsx                   # 최상위 화면 전환 라우팅
│   └── main.jsx                  # React 진입점
├── .env.example
├── package.json
└── vite.config.js
```

---

## 🛠️ 주요 수정 방법 가이드

### 1. 새로운 철학자 추가하기
[`src/data/philosophers.js`](src/data/philosophers.js) 파일의 `PHILOSOPHERS` 배열에 새 객체를 추가하기만 하면 홈 책장, 사이드바, 프롬프트까지 자동으로 연동됩니다:
```javascript
{
  id: "nietzsche",
  catalog: "NI-009",
  name: "프리드리히 니체",
  nameSub: "Friedrich Nietzsche · 1844–1900",
  era: "근대 독일 · 실존주의",
  school: "초인 · 운명애(Amor Fati)",
  keywords: ["#초인", "#운명애", "#극복"],
  quote: "나를 죽이지 못하는 고통은 나를 더 강하게 만든다.",
  hook: "너를 옭아매는 낡은 가치에서 벗어나 볼까?",
  about: "스스로 자신의 삶의 주인이 되어 고난을 딛고 일어서는 삶을 강조한 독일의 철학자.",
  strength: "좌절을 극복하고 나만의 길을 찾고 싶을 때",
  monogram: "N",
  color: "oklch(0.48 0.12 25)",
  persona: `당신은 철학자 니체입니다...`,
  openers: ["힘든 일을 겪어서 모든 게 무의미하게 느껴져요.", "남들의 기대에 맞추며 사는 게 지쳐요."]
}
```

### 2. 오늘의 질문 추가 및 수정
[`src/data/dailyQuestions.js`](src/data/dailyQuestions.js)의 `DAILY_QUESTIONS` 배열에 질문을 추가하거나 문구를 변경할 수 있습니다.

### 3. 디자인/색상/폰트 변경
[`src/styles/theme.css`](src/styles/theme.css) 상단의 CSS 변수(`--paper`, `--ink`, `--accent` 등)를 수정하여 전체 분위기를 변경할 수 있습니다.

### 4. 실제 AI API Key 연동
1. 프로젝트 루트에 `.env` 파일 생성
2. `VITE_ANTHROPIC_API_KEY=내_API_키` 입력 후 실행

---

## 🚀 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev
```
