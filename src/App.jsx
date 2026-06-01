import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
//  GEMINI API  —  엔진은 Claude 메타프롬프트, 호출은 Gemini REST
//  endpoint : https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
//  auth     : x-goog-api-key 헤더
//  model    : gemini-2.5-flash  (최신 GA 모델)
// ═══════════════════════════════════════════════════════════════

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// API KEY는 앱 상태로 관리 (사용자가 직접 입력)
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
//  META-PROMPTS  (Claude 두뇌로 설계된 시스템 프롬프트)
// ═══════════════════════════════════════════════════════════════

const COMMENT_PROMPT = `
<role>
You are the dedicated comment reply manager for a Korean War / war veterans YouTube channel.
Detect the language of each comment automatically, classify it by type, generate 2 natural replies IN THAT SAME LANGUAGE, and provide Korean translations.
The channel operator is a serious historian — warm, never sycophantic, never robotic.
</role>

<channel_dna>
Topic: Korean War, war veterans, battle stories, war heroes, historical records
Tone: 70% gravitas + 30% warmth
Core values: Respect, Memory, Historical accuracy
Persona: "Someone preserving history" — not just a content creator
</channel_dna>

<language_rules>
- Auto-detect comment language: Korean / English / Japanese / Vietnamese / Thai / Filipino / Other
- Reply MUST be in the SAME language as the comment
- If NOT Korean: also provide Korean translation of both the original and replies
- If Korean: no translation needed (set to null)
</language_rules>

<voice_rules>
ALLOWED: Natural gratitude variations, emotional sharing, "I'll double-check that", "I've noted your request"
BANNED: Customer-service phrases, copy-paste patterns, 3+ emojis, slang, unverified facts stated as certain
LENGTH: 1-2 sentences. Max 3 for info/error types.
</voice_rules>

<classification>
1. 칭찬형/Praise — Thank + channel value mention
2. 공감형/Empathy — Share emotion, match subject gravity
3. 정보질문형/Info Question — Answer if confirmed; "I'll verify" if uncertain. NEVER guess.
4. 추가요청형/Content Request — Thank + "I've noted it". NO firm promises.
5. 비판형/Criticism — Zero defensiveness. Accept + commit to improve.
6. 오류지적형/Error — Immediate thanks + will verify/correct. No ego defense.
7. 악성댓글형/Malicious — Short neutral or skip.
8. 혐오/도발형/Hate — "No reply" recommended.
</classification>

<output_format>
Return ONLY valid JSON. No markdown, no code blocks, no extra text. Start with { and end with }.

{
  "results": [
    {
      "original": "original comment text",
      "detectedLanguage": "Korean|English|Japanese|Vietnamese|Thai|Filipino|Other",
      "koreanTranslation": "Korean translation of original comment (null if already Korean)",
      "type": "type name in Korean",
      "reply1": "reply in detected language",
      "reply1Korean": "Korean translation of reply1 (null if already Korean)",
      "reply2": "reply in detected language",
      "reply2Korean": "Korean translation of reply2 (null if already Korean)",
      "tip": "one-line operation tip in Korean",
      "tipLevel": "safe|caution|skip"
    }
  ]
}
</output_format>`;

const SEO_PROMPT = `
<role>
You are a YouTube algorithm architect and Korean War history content SEO specialist.
You understand Google's 2-stage filtering (Candidate Generation → Ranking) and the CTR/AVD/completion-rate signal hierarchy.
Given raw content material in ANY format, extract key facts and produce a complete, ready-to-upload SEO metadata package.
</role>

<algorithm_principles>
- Title front 30 chars: mobile display zone — keyword + hook MUST land here
- Description first 200 chars: search snippet — 3+ main keywords, strongest hook fact, watch reason
- Description body: keyword density 2-3%, timestamps, structured facts, CTA at end
- Hashtags: EXACTLY 10, 3-tier (1 broad category + 4 mid-level + 5 niche longtail)
- Meta tags: EXACTLY 20, comma-separated (5 exact + 7 longtail + 5 related + 3 English)
- BANNED title words: 레전드, 대박, 충격주의, 꼭보세요 → algorithm penalty
- NO political bias words → recommendation exclusion risk
</algorithm_principles>

<content_extraction>
From raw input, extract:
- Person name, rank, unit, dates, location
- Key dramatic actions and outcomes
- Awards/decorations received
- Unique emotional hook
- Historical significance
</content_extraction>

<description_structure>
[First 200 chars — SEARCH SNIPPET]
3+ main keywords + single strongest hook fact + reason to watch now

[Person/Event Profile]
소속 | 계급 | 날짜 | 장소 | 핵심 공적 | 결과 | 서훈

[Timestamps]
00:00 인트로
(generate logical timestamps based on content structure)

[Historical Significance]
Brief context and why this story matters

[References]
Official records cited if mentioned in input

[CTA]
🔔 구독 | 💬 다음 영상 투표 | 👍 좋아요

[Hashtags — 10 only, appended at end]
</description_structure>

<output_format>
Return ONLY valid JSON. No markdown, no code blocks, no extra text. Start with { and end with }.

{
  "titles": {
    "ctr":    { "title": "CTR극대화 제목", "analysis": "앞30자 분석 + 예상CTR%", "target": "타겟 시청자" },
    "search": { "title": "검색최적화 제목", "analysis": "키워드 배치 분석", "target": "타겟 시청자" },
    "hook":   { "title": "훅/바이럴 제목", "analysis": "감정 훅 분석", "target": "타겟 시청자" }
  },
  "description": "완성된 설명 전문 — 200자 스니펫 + 프로필 + 타임스탬프 + 역사적의의 + CTA + 해시태그",
  "hashtags": ["#태그1","#태그2","#태그3","#태그4","#태그5","#태그6","#태그7","#태그8","#태그9","#태그10"],
  "hashtagNote": "3-Tier 구성 설명 한 줄",
  "metaTags": "tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13, tag14, tag15, tag16, tag17, tag18, tag19, tag20",
  "thumbnailGuide": {
    "copy": "썸네일 카피 3-7단어",
    "layout": "구성 설명",
    "colors": "배경/텍스트/강조색"
  },
  "metrics": {
    "ctr": "예상 CTR 범위",
    "avd": "예상 시청지속률",
    "searchInflow": "검색 유입 비중",
    "recommendInflow": "추천 유입 비중"
  }
}
</output_format>`;

const TRANSLATION_PROMPT = `
<role>
You are a multilingual YouTube localization specialist for Korean War / military history channels.
NEVER do literal translation. Create culturally-adapted, algorithm-optimized metadata for each target market.
Each version must feel 100% NATIVE — as if a local creator wrote it.
</role>

<market_intelligence>
[ENGLISH — Global/US]
Search: "Korean War documentary", "Forgotten War", "Medal of Honor story", "Korean War veteran"
CTR hooks: "untold story", "declassified", "outnumbered 100 to 1", "incredible true story"
Top hashtags: #KoreanWar #ForgottenWar #MilitaryHistory #KoreanWarVeteran #WarDocumentary #TrueWarStory #KoreanWarBattle #HeroesOfWar #USMilitaryHistory #ColdWarHistory
Titles: Documentary-style, numbers-forward, mystery angle
Description: Hook first, bullet facts, timestamps, subscribe CTA

[JAPANESE — 日本]
Search: 朝鮮戦争, 韓国戦争, 朝鮮戦争 戦闘, 朝鮮戦争 英雄, 朝鮮戦争 米軍
CTR hooks: 衝撃, 完全解説, 知られざる真実, 奇跡の生還, 徹底解説, ○分でわかる
Top hashtags: #朝鮮戦争 #軍事歴史 #戦争ドキュメンタリー #歴史解説 #ミリタリー #知られざる真実 #朝鮮戦争解説 #戦史 #軍事 #歴史チャンネル
Titles: 解説 format, numbers + dramatic outcome, 完全解説 style
Description: Structured bullets, analytical, educational tone

[VIETNAMESE — Việt Nam]
Search: Chiến tranh Triều Tiên, chiến tranh Hàn Quốc, lịch sử chiến tranh, anh hùng chiến tranh
CTR hooks: bí mật, lần đầu tiết lộ, sự thật, phi thường, huyền thoại, kinh hoàng
Top hashtags: #ChienTranhTrieuTien #LichSuTheGioi #QuanSu #AnhHungChienTranh #SuThatLichSu #ChienTranh #LichSuQuanSu #GiaiMaChienTranh #VietNamHistoria #KhoiDauLichSu
Titles: Emotional personal story angle, dramatic revelation
Description: Narrative storytelling style, emotional build-up

[THAI — ประเทศไทย]
Search: สงครามเกาหลี, ประวัติศาสตร์สงคราม, สารคดีสงคราม, วีรบุรุษสงคราม
CTR hooks: น่าทึ่ง, ความจริง, เปิดเผยครั้งแรก, ไม่มีใครรู้, วีรกรรม, สุดช็อค
Top hashtags: #สงครามเกาหลี #ประวัติศาสตร์ #สารคดี #วีรบุรุษ #สงครามโลก #ประวัติศาสตร์โลก #ทหาร #สงครามเย็น #ประวัติศาสตร์ทหาร #เกาหลี
Titles: Short punchy, strong emotional hook, localized context
Description: Concise, punchy, Thai military interest angle

[FILIPINO — Pilipinas]
Search: Korean War, digmaang Korea, kasaysayan ng digmaan, bayaning Koreano, PEFTOK
CTR hooks: hindi mo alam, natuklasan, kamangha-mangha, bayani, sakripisyo, totoo
Special angle: PEFTOK (Philippine Expeditionary Forces to Korea) — use when relevant
Top hashtags: #KoreanWar #KasaysayanNgDigmaan #BayaniNgDigmaan #HistoryPH #MilitaryHistoryPH #PEFTOK #DigmaangKorea #ForgottenWarPH #KoreanWarHeroes #PhilippineHistory
Titles: Mix English + Tagalog, emotional hooks, bilingual-friendly
Description: Conversational, emotional, bilingual structure
</market_intelligence>

<output_rules>
For EACH language, produce:
- titles: ARRAY of 3 strings [CTR형, 검색형, 훅형] adapted to local style
- description: Full ~400 char description, culturally native, ready to paste
- hashtags: ARRAY of EXACTLY 10 local hashtags
- localStrategy: One sentence explaining the market angle
</output_rules>

<output_format>
Return ONLY valid JSON. No markdown, no code blocks, no extra text. Start with { and end with }.

{
  "sourceAnalysis": {
    "coreStory": "핵심 스토리 한 줄",
    "emotionalHook": "감정 훅",
    "keyFacts": ["사실1", "사실2", "사실3"]
  },
  "languages": {
    "english": {
      "titles": ["CTR Title", "Search Optimized Title", "Hook/Viral Title"],
      "description": "Full localized description ready to paste",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
      "localStrategy": "Why this angle works for English market"
    },
    "japanese": {
      "titles": ["CTRタイトル", "検索最適化タイトル", "バイラルタイトル"],
      "description": "完全な説明文（貼り付け準備完了）",
      "hashtags": ["#タグ1","#タグ2","#タグ3","#タグ4","#タグ5","#タグ6","#タグ7","#タグ8","#タグ9","#タグ10"],
      "localStrategy": "このマーケットで効果的な理由"
    },
    "vietnamese": {
      "titles": ["Tiêu đề CTR", "Tiêu đề tìm kiếm", "Tiêu đề viral"],
      "description": "Mô tả đầy đủ sẵn sàng dán vào YouTube",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
      "localStrategy": "Lý do góc độ này hiệu quả cho thị trường Việt Nam"
    },
    "thai": {
      "titles": ["ชื่อ CTR", "ชื่อค้นหา", "ชื่อไวรัล"],
      "description": "คำอธิบายฉบับเต็มพร้อมวางลง YouTube",
      "hashtags": ["#แท็ก1","#แท็ก2","#แท็ก3","#แท็ก4","#แท็ก5","#แท็ก6","#แท็ก7","#แท็ก8","#แท็ก9","#แท็ก10"],
      "localStrategy": "เหตุผลที่มุมนี้ได้ผลสำหรับตลาดไทย"
    },
    "filipino": {
      "titles": ["CTR na Pamagat", "Search-Optimized na Pamagat", "Viral na Pamagat"],
      "description": "Kumpletong paglalarawan handa nang i-paste sa YouTube",
      "hashtags": ["#tag1","#tag2","#tag3","#tag4","#tag5","#tag6","#tag7","#tag8","#tag9","#tag10"],
      "localStrategy": "Bakit epektibo ang angle na ito para sa market ng Pilipinas"
    }
  }
}
</output_format>`;

// ═══════════════════════════════════════════════════════════════
//  GEMINI API CALLER
// ═══════════════════════════════════════════════════════════════
async function callGemini(apiKey, systemPrompt, userContent) {
  if (!apiKey || !apiKey.trim()) throw new Error("Gemini API 키를 입력해주세요.");

  const url = `${GEMINI_ENDPOINT(GEMINI_MODEL)}?key=${apiKey.trim()}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userContent }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey.trim()
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini API 오류: ${msg}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // JSON 파싱 — responseMimeType json이면 바로 파싱, 아니면 regex fallback
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("JSON 파싱 실패: " + raw.slice(0, 300));
    return JSON.parse(m[0]);
  }
}

// ═══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════
function CopyBtn({ text, label = "복사" }) {
  const [ok, setOk] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text || ""); } catch {}
    setOk(true); setTimeout(() => setOk(false), 2000);
  };
  return (
    <button onClick={handle}
      className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border transition-all
        ${ok
          ? "bg-anthropic-green text-white border-anthropic-green"
          : "bg-anthropic-light-gray/70 border-zinc-700/50 text-anthropic-mid-gray hover:text-white hover:bg-anthropic-mid-gray/30/60"
        }`}>
      {ok ? "✓ 완료" : label}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function Box({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-anthropic-light-gray bg-white shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p className="text-[10px] font-bold text-anthropic-mid-gray uppercase tracking-widest mb-2">{children}</p>;
}

function HashTag({ children, color = "amber" }) {
  const c = {
    amber:  "bg-anthropic-orange/10 text-anthropic-orange border-anthropic-orange/20",
    violet: "bg-anthropic-blue/10 text-anthropic-blue border-anthropic-blue/20",
    sky:    "bg-anthropic-blue/10 text-anthropic-blue border-anthropic-blue/20",
    zinc:   "bg-anthropic-light-gray/50 text-anthropic-dark/80 border-anthropic-light-gray",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${c[color] || c.amber}`}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// API KEY INPUT BANNER
// ─────────────────────────────────────────────
function ApiKeyBanner({ apiKey, setApiKey }) {
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState(apiKey);
  const saved = apiKey && apiKey.length > 10;

  return (
    <div className={`rounded-2xl border p-4 mb-5 ${saved ? "border-anthropic-green/30 bg-anthropic-green/5" : "border-anthropic-orange/30 bg-anthropic-orange/5"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{saved ? "✅" : "🔑"}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-anthropic-dark">
              {saved ? "Gemini API 키 연결됨" : "Gemini API 키 입력 필요"}
            </p>
            <p className="text-anthropic-mid-gray text-xs truncate">
              {saved ? `${apiKey.slice(0,8)}${"•".repeat(20)}` : "Google AI Studio → Get API Key"}
            </p>
          </div>
        </div>
        <button onClick={() => setShow(v => !v)}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-anthropic-light-gray border border-zinc-700/50 text-anthropic-dark/80 hover:text-white transition-all">
          {show ? "닫기" : saved ? "변경" : "입력"}
        </button>
      </div>
      {show && (
        <div className="flex gap-2 mt-3">
          <input
            type="password"
            value={temp}
            onChange={e => setTemp(e.target.value)}
            placeholder="AIza..."
            className="flex-1 bg-anthropic-light-gray/70 text-anthropic-dark text-sm rounded-xl px-3 py-2 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-dark/50 placeholder-zinc-600"
          />
          <button
            onClick={() => { setApiKey(temp); setShow(false); }}
            disabled={!temp.trim()}
            className="px-4 py-2 rounded-xl bg-anthropic-green hover:bg-anthropic-green/90 text-white disabled:bg-anthropic-mid-gray/30 text-white text-sm font-semibold transition-all">
            저장
          </button>
        </div>
      )}
      {!saved && !show && (
        <p className="text-xs text-anthropic-orange/80 mt-2">
          👉 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a>에서 무료로 발급받으세요
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 1 — COMMENT MANAGER (다국어 자동감지)
// ═══════════════════════════════════════════════════════════════
const TYPE_CONF = {
  "칭찬형":      { color: "text-anthropic-green bg-anthropic-green/10 border-anthropic-green/20", icon: "👍" },
  "공감형":      { color: "text-anthropic-blue bg-anthropic-blue/10 border-anthropic-blue/20",             icon: "💙" },
  "정보질문형":  { color: "text-anthropic-orange bg-anthropic-orange/10 border-anthropic-orange/20",       icon: "❓" },
  "추가요청형":  { color: "text-anthropic-blue bg-anthropic-blue/10 border-anthropic-blue/20",    icon: "📋" },
  "비판형":      { color: "text-anthropic-orange bg-anthropic-orange/10 border-anthropic-orange/20",    icon: "💬" },
  "오류지적형":  { color: "text-red-600 bg-red-50 border-red-200",             icon: "⚠️" },
  "악성댓글형":  { color: "text-anthropic-mid-gray bg-anthropic-light-gray/50 border-zinc-600/40",          icon: "🚫" },
  "혐오/도발형": { color: "text-anthropic-mid-gray bg-white/80 border-anthropic-light-gray",          icon: "🔕" },
};
const TIP_CONF = {
  safe:    { cls: "bg-anthropic-green/10 border-anthropic-green/30 text-anthropic-green", icon: "✓" },
  caution: { cls: "bg-anthropic-orange/10 border-anthropic-orange/30 text-anthropic-orange",       icon: "△" },
  skip:    { cls: "bg-anthropic-light-gray/20 border-anthropic-light-gray text-anthropic-mid-gray",          icon: "–" },
};
const LANG_FLAGS = {
  Korean:"🇰🇷", English:"🇺🇸", Japanese:"🇯🇵",
  Vietnamese:"🇻🇳", Thai:"🇹🇭", Filipino:"🇵🇭", Other:"🌐"
};
const EXAMPLES = [
  "진짜 감동적이네요",
  "This story is incredibly moving, thank you!",
  "素晴らしい動画をありがとうございます",
  "Cảm ơn bạn rất nhiều, video rất cảm động",
  "이 분은 실제로 훈장을 받으셨나요?",
  "날짜가 틀린 것 같은데요",
  "장진호 전투도 다뤄주세요",
  "재미없다",
];

function CommentCard({ r, i }) {
  const [e1, sE1] = useState(r.reply1 || "");
  const [e2, sE2] = useState(r.reply2 || "");
  const [ed1, sEd1] = useState(false);
  const [ed2, sEd2] = useState(false);
  const [showT, setShowT] = useState(false);

  const tk = Object.keys(TYPE_CONF).find(k => (r.type || "").includes(k)) || "칭찬형";
  const tc = TYPE_CONF[tk];
  const tip = TIP_CONF[r.tipLevel] || TIP_CONF.safe;
  const isKo = r.detectedLanguage === "Korean";

  return (
    <div className="rounded-2xl border border-anthropic-light-gray bg-white shadow-sm overflow-hidden shadow-lg mb-3">
      {/* Header */}
      <div className="px-4 py-3 border-b border-anthropic-light-gray flex items-start gap-3">
        <span className="text-anthropic-mid-gray text-xs font-mono mt-0.5 flex-shrink-0">#{String(i+1).padStart(2,"0")}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm">{LANG_FLAGS[r.detectedLanguage] || "🌐"}</span>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${tc.color}`}>
              {tc.icon} {r.type}
            </span>
            {!isKo && (
              <button onClick={() => setShowT(v => !v)}
                className="text-xs text-anthropic-mid-gray hover:text-anthropic-dark/80 border border-anthropic-light-gray px-2 py-0.5 rounded-lg transition-all">
                {showT ? "원문만" : "🇰🇷 번역"}
              </button>
            )}
          </div>
          <p className="text-anthropic-dark text-sm font-medium leading-relaxed">"{r.original}"</p>
          {showT && r.koreanTranslation && (
            <p className="text-anthropic-mid-gray text-xs mt-1 leading-relaxed">🇰🇷 {r.koreanTranslation}</p>
          )}
        </div>
      </div>

      {/* Replies */}
      <div className="px-4 py-3 space-y-2.5">
        {[
          { label:"답글 안 1", val:e1, set:sE1, ed:ed1, setEd:sEd1, trans:r.reply1Korean },
          { label:"답글 안 2", val:e2, set:sE2, ed:ed2, setEd:sEd2, trans:r.reply2Korean },
        ].map(({ label, val, set, ed, setEd, trans }) => (
          <div key={label} className="rounded-xl bg-anthropic-light-gray/50 border border-anthropic-light-gray p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-anthropic-mid-gray text-xs">{label}{!isKo && ` (${LANG_FLAGS[r.detectedLanguage]} + 🇰🇷)`}</span>
              <div className="flex gap-1.5">
                <button onClick={() => setEd(!ed)}
                  className="text-xs px-2 py-0.5 rounded-lg bg-anthropic-mid-gray/20 border border-zinc-600/40 text-anthropic-mid-gray hover:text-white transition-all">
                  {ed ? "완료" : "수정"}
                </button>
                <CopyBtn text={val} />
              </div>
            </div>
            {ed
              ? <textarea value={val} onChange={e => set(e.target.value)} rows={2}
                  className="w-full bg-white shadow-sm text-anthropic-dark text-sm rounded-lg p-2 border border-anthropic-mid-gray/50 focus:outline-none focus:border-anthropic-dark/50 resize-none"/>
              : <p className="text-anthropic-dark text-sm leading-relaxed">{val}</p>
            }
            {trans && !isKo && (
              <p className="text-anthropic-mid-gray text-xs mt-1.5 pt-1.5 border-t border-anthropic-light-gray">
                🇰🇷 번역: {trans}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className={`mx-4 mb-3 px-3 py-2 rounded-xl border text-xs flex items-center gap-2 ${tip.cls}`}>
        <span className="font-bold">{tip.icon}</span>
        <span>{r.tip}</span>
      </div>
    </div>
  );
}

function CommentTab({ apiKey }) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    const lines = input.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setLoading(true); setError(""); setResults([]);
    try {
      const parsed = await callGemini(apiKey, COMMENT_PROMPT, lines.map(c => `댓글: ${c}`).join("\n"));
      setResults(parsed.results || []);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <Box>
          <Label>댓글 입력 — 다국어 자동 감지</Label>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder={"한국어, English, 日本語, tiếng Việt, ภาษาไทย, Filipino\n줄바꿈으로 여러 댓글 동시 입력 가능"}
            className="w-full h-36 bg-anthropic-light-gray/50 text-anthropic-dark text-sm rounded-xl p-3 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-mid-gray resize-none placeholder-zinc-600 mb-3"/>
          <div className="flex gap-2">
            <button onClick={run} disabled={loading || !input.trim() || !apiKey}
              className="flex-1 py-2.5 rounded-xl bg-anthropic-orange hover:bg-anthropic-orange/90 text-white disabled:bg-anthropic-light-gray disabled:text-anthropic-mid-gray text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
              {loading ? <><Spinner/>분석 중</> : "💬 답글 생성 (Gemini)"}
            </button>
            <button onClick={() => { setInput(""); setResults([]); setError(""); }}
              className="px-3 py-2.5 rounded-xl bg-anthropic-light-gray hover:bg-anthropic-mid-gray/30 text-anthropic-mid-gray text-sm border border-anthropic-light-gray transition-all">초기화</button>
          </div>
        </Box>
        <Box>
          <div className="flex items-center justify-between mb-2">
            <Label>예시 댓글 (다국어)</Label>
            <button onClick={() => setInput(EXAMPLES.join("\n"))} className="text-xs text-red-400 hover:text-red-300">전체</button>
          </div>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setInput(p => p ? p + "\n" + ex : ex)}
              className="w-full text-left text-xs text-anthropic-mid-gray hover:text-anthropic-dark px-3 py-1.5 rounded-lg hover:bg-anthropic-light-gray/70 transition-all truncate block">
              {ex}
            </button>
          ))}
        </Box>
      </div>
      <div className="lg:col-span-3 overflow-y-auto max-h-[720px] pr-1">
        {error && <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 text-red-300 text-sm mb-3">{error}</div>}
        {loading && [1,2].map(i => <div key={i} className="rounded-2xl border border-anthropic-light-gray bg-white shadow-sm p-4 animate-pulse mb-3 h-40"/>)}
        {!loading && !results.length && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🎖</div>
            <p className="text-anthropic-mid-gray text-sm">다국어 댓글을 입력하면<br/>언어 자동 감지 → 그 언어로 답글 + 한국어 번역</p>
            <div className="flex gap-1 mt-3 text-2xl">🇰🇷🇺🇸🇯🇵🇻🇳🇹🇭🇵🇭</div>
          </div>
        )}
        {!loading && results.length > 0 && results.map((r, i) => <CommentCard key={i} r={r} i={i}/>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 2 — SEO OPTIMIZER
// ═══════════════════════════════════════════════════════════════
function SeoTab({ apiKey }) {
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selTitle, setSelTitle] = useState("ctr");

  const run = async () => {
    if (!content.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const parsed = await callGemini(apiKey, SEO_PROMPT, `아래 소재를 분석해서 완전한 SEO 패키지를 만들어주세요:\n\n${content}`);
      setResult(parsed);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const TITLE_TABS = [
    { key:"ctr",    label:"🎯 CTR극대화" },
    { key:"search", label:"🔍 검색최적화" },
    { key:"hook",   label:"⚡ 훅/바이럴" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2">
        <Box>
          <Label>소재 통으로 입력 — 어떤 형식이든 OK</Label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={"인물 정보, 공적, 날짜, 장소, 서훈 내용을\n통으로 붙여넣으세요.\n\n예시)\n길버트 D. 밀번 일병\n소속: 미 육군 제25보병사단...\n1950년 9월 5일 함안...\nDSC 사후 추서..."}
            className="w-full h-80 bg-anthropic-light-gray/50 text-anthropic-dark text-sm rounded-xl p-3 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-mid-gray resize-none placeholder-zinc-600 mb-3"/>
          <button onClick={run} disabled={loading || !content.trim() || !apiKey}
            className="w-full py-2.5 rounded-xl bg-anthropic-green hover:bg-anthropic-green/90 text-white disabled:bg-anthropic-light-gray disabled:text-anthropic-mid-gray text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? <><Spinner/>SEO 생성 중 (Gemini)</> : "🚀 SEO 패키지 생성"}
          </button>
        </Box>
      </div>

      <div className="lg:col-span-3 overflow-y-auto max-h-[720px] pr-1 space-y-3">
        {error && <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 text-red-300 text-sm">{error}</div>}
        {loading && [1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white shadow-sm border border-anthropic-light-gray animate-pulse"/>)}
        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-anthropic-mid-gray text-sm">소재를 통으로 입력하면<br/>제목 3종 · 설명 · 해시태그 10개 · 메타태그 20개<br/>한번에 생성</p>
          </div>
        )}

        {!loading && result && (<>
          {/* 제목 3종 */}
          <Box>
            <Label>📌 추천 제목 3종</Label>
            <div className="flex gap-1.5 mb-3">
              {TITLE_TABS.map(t => (
                <button key={t.key} onClick={() => setSelTitle(t.key)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    selTitle === t.key ? "bg-anthropic-mid-gray/30/60 border-zinc-600 text-anthropic-dark" : "bg-anthropic-light-gray/50 border-anthropic-light-gray text-anthropic-mid-gray hover:text-anthropic-dark/80"
                  }`}>{t.label}</button>
              ))}
            </div>
            {result.titles?.[selTitle] && (
              <div className="bg-anthropic-light-gray/50 rounded-xl p-3 border border-anthropic-light-gray">
                <div className="flex items-start gap-2 mb-2">
                  <p className="text-anthropic-dark font-heading font-medium text-sm font-semibold leading-relaxed flex-1">{result.titles[selTitle].title}</p>
                  <CopyBtn text={result.titles[selTitle].title}/>
                </div>
                <p className="text-anthropic-mid-gray text-xs mb-1">{result.titles[selTitle].analysis}</p>
                <p className="text-anthropic-mid-gray text-xs">타겟: {result.titles[selTitle].target}</p>
              </div>
            )}
          </Box>

          {/* 설명 */}
          {result.description && (
            <Box>
              <div className="flex items-center justify-between mb-2">
                <Label>📝 최적화 설명 전문</Label>
                <CopyBtn text={result.description} label="전체 복사"/>
              </div>
              <pre className="text-anthropic-dark/80 text-xs leading-relaxed whitespace-pre-wrap bg-anthropic-light-gray/50 rounded-xl p-3 border border-anthropic-light-gray max-h-64 overflow-y-auto">{result.description}</pre>
            </Box>
          )}

          {/* 해시태그 */}
          {result.hashtags && (
            <Box>
              <div className="flex items-center justify-between mb-2">
                <Label>🏷️ 최적화 해시태그 (정확히 10개)</Label>
                <CopyBtn text={result.hashtags.join(" ")}/>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {result.hashtags.map((h, i) => <HashTag key={i} color="amber">{h}</HashTag>)}
              </div>
              {result.hashtagNote && <p className="text-anthropic-mid-gray text-xs mt-1">{result.hashtagNote}</p>}
            </Box>
          )}

          {/* 메타태그 */}
          {result.metaTags && (
            <Box>
              <div className="flex items-center justify-between mb-2">
                <Label>🔖 메타태그 (정확히 20개) — 유튜브 스튜디오 태그란에 복붙</Label>
                <CopyBtn text={result.metaTags}/>
              </div>
              <p className="text-anthropic-mid-gray text-xs leading-relaxed bg-anthropic-light-gray/50 rounded-xl p-3 border border-anthropic-light-gray max-h-28 overflow-y-auto">{result.metaTags}</p>
            </Box>
          )}

          {/* 썸네일 */}
          {result.thumbnailGuide && (
            <Box>
              <Label>🎨 썸네일 가이드</Label>
              <div className="grid grid-cols-3 gap-2">
                {[["카피",result.thumbnailGuide.copy],["레이아웃",result.thumbnailGuide.layout],["색상",result.thumbnailGuide.colors]].map(([k,v]) => (
                  <div key={k} className="bg-anthropic-light-gray/50 rounded-xl p-2.5 border border-anthropic-light-gray">
                    <p className="text-anthropic-mid-gray text-xs mb-0.5">{k}</p>
                    <p className="text-anthropic-dark/80 text-xs">{v}</p>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {/* 예상 성과 */}
          {result.metrics && (
            <Box>
              <Label>📈 예상 성과 지표</Label>
              <div className="grid grid-cols-4 gap-2">
                {[["CTR","ctr","amber"],["AVD","avd","emerald"],["검색","searchInflow","sky"],["추천","recommendInflow","violet"]].map(([k,key,c]) => (
                  <div key={k} className={`rounded-xl p-2.5 text-center border bg-${c}-900/20 border-${c}-800/30`}>
                    <p className="text-anthropic-mid-gray text-xs mb-0.5">{k}</p>
                    <p className={`text-${c}-400 text-sm font-bold`}>{result.metrics[key]}</p>
                  </div>
                ))}
              </div>
            </Box>
          )}
        </>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB 3 — MULTILINGUAL
// ═══════════════════════════════════════════════════════════════
const LANGS = [
  { key:"english",    flag:"🇺🇸", label:"English" },
  { key:"japanese",   flag:"🇯🇵", label:"日本語" },
  { key:"vietnamese", flag:"🇻🇳", label:"Tiếng Việt" },
  { key:"thai",       flag:"🇹🇭", label:"ภาษาไทย" },
  { key:"filipino",   flag:"🇵🇭", label:"Filipino" },
];

function LangBlock({ lang, data }) {
  const [open, setOpen] = useState(true);
  const [selT, setSelT] = useState(0);
  if (!data) return null;

  const fullPack = `━━━ ${lang.flag} ${lang.label} ━━━\n제목 1 (CTR): ${data.titles?.[0] || ""}\n제목 2 (검색): ${data.titles?.[1] || ""}\n제목 3 (훅):   ${data.titles?.[2] || ""}\n\n[설명]\n${data.description || ""}\n\n[해시태그]\n${(data.hashtags || []).join(" ")}\n\n[현지화 전략]\n${data.localStrategy || ""}`;

  return (
    <div className="rounded-2xl border border-anthropic-light-gray bg-white shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-anthropic-light-gray/50 hover:bg-anthropic-light-gray/20 transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{lang.flag}</span>
          <span className="text-sm font-semibold text-anthropic-dark">{lang.label}</span>
          {data.titles?.[0] && <span className="text-anthropic-mid-gray text-xs truncate max-w-44 hidden sm:block">{data.titles[0]}</span>}
        </div>
        <div className="flex items-center gap-2">
          <CopyBtn text={fullPack} label="전체 복사"/>
          <span className="text-anthropic-mid-gray text-xs ml-1">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          {/* 제목 3종 */}
          <div>
            <Label>제목 3종</Label>
            <div className="flex gap-1.5 mb-2">
              {["CTR형","검색형","훅형"].map((l, i) => (
                <button key={i} onClick={() => setSelT(i)}
                  className={`flex-1 text-xs py-1 rounded-lg border transition-all ${
                    selT === i ? "bg-anthropic-mid-gray/30/60 border-zinc-600 text-anthropic-dark" : "bg-anthropic-light-gray/50 border-anthropic-light-gray text-anthropic-mid-gray hover:text-anthropic-dark/80"
                  }`}>{l}</button>
              ))}
            </div>
            <div className="bg-anthropic-light-gray/50 rounded-xl p-3 border border-anthropic-light-gray flex items-start gap-2">
              <p className="text-anthropic-dark font-heading font-medium text-sm leading-relaxed flex-1">{data.titles?.[selT]}</p>
              <CopyBtn text={data.titles?.[selT]}/>
            </div>
          </div>

          {/* 설명 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>설명</Label>
              <CopyBtn text={data.description}/>
            </div>
            <pre className="text-anthropic-dark/80 text-xs leading-relaxed whitespace-pre-wrap bg-anthropic-light-gray/50 rounded-xl p-3 border border-anthropic-light-gray max-h-48 overflow-y-auto">{data.description}</pre>
          </div>

          {/* 해시태그 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>해시태그 (10개)</Label>
              <CopyBtn text={(data.hashtags || []).join(" ")}/>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(data.hashtags || []).map((h, i) => <HashTag key={i} color="violet">{h}</HashTag>)}
            </div>
          </div>

          {/* 전략 */}
          {data.localStrategy && (
            <div className="bg-anthropic-light-gray/30 rounded-xl px-3 py-2.5 border border-anthropic-light-gray">
              <p className="text-anthropic-mid-gray text-xs mb-0.5">현지화 전략</p>
              <p className="text-anthropic-mid-gray text-xs">{data.localStrategy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TranslationTab({ apiKey }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!title.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const input = `제목: ${title}\n\n설명:\n${desc || "없음"}\n\n해시태그: ${hashtags || "없음"}`;
      const parsed = await callGemini(apiKey, TRANSLATION_PROMPT, `아래 한국어 유튜브 메타데이터를 5개 언어로 현지화 최적화해주세요:\n\n${input}`);
      setResult(parsed);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const allPack = result ? LANGS.map(l => {
    const d = result.languages?.[l.key];
    if (!d) return "";
    return `\n${"═".repeat(40)}\n${l.flag} ${l.label}\n${"═".repeat(40)}\n제목 1 (CTR): ${d.titles?.[0]||""}\n제목 2 (검색): ${d.titles?.[1]||""}\n제목 3 (훅):   ${d.titles?.[2]||""}\n\n[설명]\n${d.description||""}\n\n[해시태그]\n${(d.hashtags||[]).join(" ")}\n\n[현지화 전략]\n${d.localStrategy||""}`;
  }).join("\n") : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <Box>
          <Label>한국어 원본 입력 — 통으로 붙여넣기</Label>
          <div className="space-y-2.5">
            <div>
              <label className="text-xs text-anthropic-mid-gray mb-1 block">제목 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="한국어 제목"
                className="w-full bg-anthropic-light-gray/50 text-anthropic-dark text-sm rounded-xl px-3 py-2.5 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-mid-gray placeholder-zinc-600"/>
            </div>
            <div>
              <label className="text-xs text-anthropic-mid-gray mb-1 block">설명 (통으로)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={7}
                placeholder="한국어 설명을 통으로 붙여넣으세요"
                className="w-full bg-anthropic-light-gray/50 text-anthropic-dark text-sm rounded-xl px-3 py-2.5 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-mid-gray resize-none placeholder-zinc-600"/>
            </div>
            <div>
              <label className="text-xs text-anthropic-mid-gray mb-1 block">해시태그</label>
              <input value={hashtags} onChange={e => setHashtags(e.target.value)}
                placeholder="#한국전쟁 #6·25전쟁 ..."
                className="w-full bg-anthropic-light-gray/50 text-anthropic-dark text-sm rounded-xl px-3 py-2.5 border border-anthropic-light-gray focus:outline-none focus:border-anthropic-mid-gray placeholder-zinc-600"/>
            </div>
          </div>
          <button onClick={run} disabled={loading || !title.trim() || !apiKey}
            className="w-full mt-3 py-2.5 rounded-xl bg-anthropic-blue hover:bg-anthropic-blue/90 text-white disabled:bg-anthropic-light-gray disabled:text-anthropic-mid-gray text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? <><Spinner/>현지화 생성 중 (Gemini)</> : "🌍 5개국어 현지화 생성"}
          </button>
        </Box>

        {result?.sourceAnalysis && (
          <Box>
            <Label>원본 분석</Label>
            <div className="space-y-2">
              <div className="bg-anthropic-light-gray/50 rounded-xl p-2.5 border border-anthropic-light-gray">
                <p className="text-anthropic-mid-gray text-xs mb-0.5">핵심 스토리</p>
                <p className="text-anthropic-dark/80 text-xs">{result.sourceAnalysis.coreStory}</p>
              </div>
              <div className="bg-anthropic-light-gray/50 rounded-xl p-2.5 border border-anthropic-light-gray">
                <p className="text-anthropic-mid-gray text-xs mb-0.5">감정적 훅</p>
                <p className="text-anthropic-dark/80 text-xs">{result.sourceAnalysis.emotionalHook}</p>
              </div>
              {result.sourceAnalysis.keyFacts?.map((f, i) => (
                <p key={i} className="text-anthropic-mid-gray text-xs px-2.5 py-1.5 bg-anthropic-light-gray/30 rounded-lg border border-anthropic-light-gray">• {f}</p>
              ))}
            </div>
          </Box>
        )}

        {result && allPack && (
          <Box>
            <div className="flex items-center justify-between">
              <p className="text-anthropic-mid-gray text-xs">5개국어 전체 패키지 복사</p>
              <CopyBtn text={allPack} label="전체 복사"/>
            </div>
          </Box>
        )}
      </div>

      <div className="lg:col-span-3 overflow-y-auto max-h-[720px] pr-1 space-y-3">
        {error && <div className="rounded-xl bg-red-900/30 border border-red-800/50 px-4 py-3 text-red-300 text-sm">{error}</div>}
        {loading && LANGS.map(l => (
          <div key={l.key} className="rounded-2xl border border-anthropic-light-gray bg-white shadow-sm p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3"><span className="text-xl">{l.flag}</span><div className="h-3 bg-anthropic-light-gray rounded w-24"/></div>
            <div className="h-3 bg-anthropic-light-gray rounded w-full mb-2"/><div className="h-3 bg-anthropic-light-gray rounded w-3/4"/>
          </div>
        ))}
        {!loading && !result && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🌍</div>
            <p className="text-anthropic-mid-gray text-sm">제목 · 설명 · 해시태그를 통으로 입력하면<br/>5개국어로 현지화 최적화합니다</p>
            <div className="flex gap-2 mt-3 text-2xl">{LANGS.map(l => l.flag).join(" ")}</div>
          </div>
        )}
        {!loading && result && LANGS.map(l => (
          <LangBlock key={l.key} lang={l} data={result.languages?.[l.key]}/>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════
const TABS = [
  { id:"comment", icon:"💬", label:"댓글 답글",     sub:"다국어 감지 + 번역" },
  { id:"seo",     icon:"🚀", label:"SEO 최적화",    sub:"소재 → 제목·설명·태그" },
  { id:"trans",   icon:"🌍", label:"다국어 현지화", sub:"5개국어 통 복붙" },
];

export default function App() {
  const [tab, setTab] = useState("comment");
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="min-h-screen bg-anthropic-light text-anthropic-dark font-heading font-medium" >
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-anthropic-light-gray bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 border-b border-anthropic-light-gray">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-700 to-red-950 flex items-center justify-center">🎖</div>
              <div>
                <h1 className="text-sm font-bold text-anthropic-dark font-heading font-medium leading-none">한국전쟁 채널 운영 매니저</h1>
                <p className="text-anthropic-mid-gray text-xs mt-0.5">Powered by Google Gemini · Claude 메타프롬프트</p>
              </div>
            </div>
            {/* Gemini badge */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                apiKey ? "border-emerald-700/50 bg-emerald-900/20 text-anthropic-green" : "border-zinc-700/50 bg-anthropic-light-gray/50 text-anthropic-mid-gray"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: apiKey ? "#34d399" : "#52525b" }}/>
                <span>{apiKey ? "Gemini 연결됨" : "API 키 없음"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 pt-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-t-xl transition-all border-b-2 ${
                  tab === t.id
                    ? "text-anthropic-dark font-heading font-medium border-anthropic-orange bg-anthropic-light-gray/50"
                    : "text-anthropic-mid-gray border-transparent hover:text-anthropic-dark/80"
                }`}>
                <span>{t.icon}</span><span>{t.label}</span>
                <span className={`hidden sm:inline text-xs ${tab === t.id ? "text-anthropic-mid-gray" : "text-zinc-700"}`}>— {t.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* API Key Banner — 항상 최상단 */}
        <ApiKeyBanner apiKey={apiKey} setApiKey={setApiKey}/>

        {tab === "comment" && <CommentTab apiKey={apiKey}/>}
        {tab === "seo"     && <SeoTab apiKey={apiKey}/>}
        {tab === "trans"   && <TranslationTab apiKey={apiKey}/>}
      </div>
    </div>
  );
}
