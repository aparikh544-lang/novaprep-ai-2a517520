// Edge function: generate original SAT-style practice questions via Lovable AI Gateway
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOPICS_MATH = [
  "Systems of Linear Equations",
  "Quadratics",
  "Ratios & Rates",
  "Data Analysis",
  "Linear Functions",
  "Exponents & Radicals",
];
const TOPICS_RW = [
  "Reading: Main Idea",
  "Reading: Inference",
  "Grammar: Subject-Verb",
  "Vocabulary in Context",
  "Reading: Purpose",
  "Grammar: Punctuation",
];

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const BATCH_SIZE = 6;
const PRIMARY_BATCH_TIMEOUT_MS = 18_000;
const FALLBACK_BATCH_TIMEOUT_MS = 15_000;
const BATCH_CONCURRENCY = 2;

type DifficultyBias = "balanced" | "easier" | "harder";
type SectionName = "Math" | "Reading & Writing";
type ResponseType = "multiple-choice" | "spr";

type GeneratedQuestion = {
  section: SectionName;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  passage?: string;
  prompt: string;
  choices: string[];
  correct: number;
  responseType: ResponseType;
  correctText?: string;
  explanation: string;
};

const responseFormatInstruction =
  "Return only polished final questions through the tool. Use actual newline characters for multi-line math or passages, never escaped literal \\n text.";

function buildSystemPrompt() {
  return `You are an expert SAT tutor creating ORIGINAL SAT-level practice questions only. Never create below-SAT difficulty items, never copy from official material, and never reveal hidden reasoning, chain-of-thought, self-reflection, or internal notes. Topics for Math: ${TOPICS_MATH.join(", ")}. Topics for Reading & Writing: ${TOPICS_RW.join(", ")}. Reading questions must include a short original passage (40-90 words) at authentic SAT complexity (college-prep vocabulary, dense syntax, nuanced argument). Reading & Writing questions must be multiple-choice (responseType="multiple-choice"). Math questions use a mix of multiple-choice and student-produced response (responseType="spr"); every SPR item must also include a concise correctText answer (a number, fraction like 3/4, or decimal). CRITICAL CLARITY RULES: every question must be 100% self-contained, unambiguous, grammatical, and answerable from the prompt and (if present) the passage alone. The prompt MUST end with a clear, explicit task sentence such as "What is the value of x?" or "Which choice best completes the text?" — never leave the student guessing what to find. Never reference figures, charts, images, tables, or external context. Never ask "select all that apply" — exactly one of the four choices must be correct. MATH NOTATION: use real Unicode symbols, NOT letters or LaTeX. Use √ for square root (e.g. √2, √(x+1)), ∛ for cube root, π for pi, ≤ ≥ ≠ ± ∞ ° θ Δ, superscripts ² ³ for small powers (e.g. x² + 3x − 4), · or × for multiplication, ÷ for division, fractions as a/b. Do NOT write "sqrt(", "pi", "<=", ">=", "!=", "\\frac", "\\sqrt", "$", or any backslash commands. ELA RIGOR: include real SAT-level vocabulary, multi-clause inference, evidence-pairing, and transitions where the wrong answers are highly plausible. Re-read each question and confirm a typical SAT student would understand exactly what is being asked. Double-check that exactly one choice is correct and matches the indicated correct index. Explanations: 1-2 sentences, student-facing, final only.`;
}

function buildUserPrompt(opts: {
  count: number;
  difficultyBias: DifficultyBias;
  mode: string;
  section?: SectionName;
  topic?: string;
  batchIndex: number;
  batchCount: number;
  sprCount: number;
}) {
  const { count, difficultyBias, mode, section, topic, batchIndex, batchCount, sprCount } = opts;
  let sectionInstruction = "Mix sections roughly evenly between 'Math' and 'Reading & Writing'.";
  if (section === "Math") sectionInstruction = "Section must be exactly 'Math'.";
  else if (section === "Reading & Writing") sectionInstruction = "Section must be exactly 'Reading & Writing'.";
  else if (mode === "math") sectionInstruction = "Section must be exactly 'Math'.";
  else if (mode === "reading") sectionInstruction = "Section must be exactly 'Reading & Writing'.";
  else if (mode === "redemption") sectionInstruction = "Use the section that best fits the target topic.";

  let diffInstruction = "Use roughly 20% easy, 45% medium, 35% hard. ELA must include challenging inference and rhetorical synthesis items at real SAT difficulty — never trivially easy.";
  if (difficultyBias === "harder") diffInstruction = "Skew HEAVILY toward 'hard' (about 60% hard, 30% medium, 10% easy). Hard questions should require multi-step reasoning, hidden traps, or compound skills.";
  else if (difficultyBias === "easier") diffInstruction = "Skew toward 'medium' with some 'easy'.";

  const topicInstruction = topic ? `Focus every question on this skill/topic: ${topic}.` : "Vary topics across the allowed SAT skills.";
  const mathMixInstruction = section === "Math" || mode === "math"
    ? `For this batch, return exactly ${sprCount} student-produced response questions and exactly ${count - sprCount} multiple-choice questions.`
    : "All questions in this batch must be multiple-choice.";

  return `Generate ${count} original SAT-style questions for batch ${batchIndex + 1} of ${batchCount}. ${sectionInstruction} ${diffInstruction} ${topicInstruction} ${mathMixInstruction} Avoid repeating the same setup, wording, passage pattern, or answer pattern within this batch or across batches. Make the topics, numbers, rhetorical situations, and distractor logic feel meaningfully different from one another. ${responseFormatInstruction}`;
}

async function requestQuestionBatch(params: {
  lovableApiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model: string;
  timeoutMs?: number;
}) {
  const { lovableApiKey, systemPrompt, userPrompt, model, timeoutMs = PRIMARY_BATCH_TIMEOUT_MS } = params;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("AI batch timed out"), timeoutMs);

  try {
    const aiResp = await fetch(AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_questions",
              description: "Return the generated SAT practice questions.",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string", enum: ["Math", "Reading & Writing"] },
                        topic: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        passage: { type: "string", description: "Optional reading passage." },
                        prompt: { type: "string" },
                        choices: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                        correct: { type: "integer", minimum: 0, maximum: 3 },
                        responseType: { type: "string", enum: ["multiple-choice", "spr"] },
                        correctText: { type: "string", description: "Required for student-produced Math responses." },
                        explanation: { type: "string" },
                      },
                      required: ["section", "topic", "difficulty", "prompt", "choices", "correct", "responseType", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_questions" } },
      }),
      signal: controller.signal,
    });

    if (aiResp.status === 429) return { retryable: false as const, error: "Rate limits exceeded, please try again shortly." };
    if (aiResp.status === 402) return { retryable: false as const, error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." };
    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("AI gateway error", aiResp.status, text);
      return { retryable: true as const, error: "AI gateway error" };
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) return { retryable: true as const, error: "No tool call returned" };
    const parsed = JSON.parse(args);
    return { retryable: false as const, questions: (parsed?.questions ?? []) as GeneratedQuestion[] };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("AI batch timed out; will retry with fallback model");
      return { retryable: true as const, error: "AI batch timed out" };
    }
    console.error("AI batch request failed", error);
    return { retryable: true as const, error: error instanceof Error ? error.message : "AI request failed" };
  } finally {
    clearTimeout(timeout);
  }
}

async function generateBatchWithFallback(params: {
  lovableApiKey: string;
  systemPrompt: string;
  userPrompt: string;
}) {
  const attempts = [
    { model: "google/gemini-3-flash-preview", timeoutMs: PRIMARY_BATCH_TIMEOUT_MS, suffix: "" },
    { model: "google/gemini-2.5-flash", timeoutMs: FALLBACK_BATCH_TIMEOUT_MS, suffix: " Preserve SAT realism and correctness; prioritize speed without lowering quality." },
    { model: "google/gemini-2.5-flash-lite", timeoutMs: FALLBACK_BATCH_TIMEOUT_MS, suffix: " Keep the wording concise and varied so the response returns quickly, but maintain SAT-level correctness." },
  ] as const;

  let lastError = "AI gateway error";
  for (const attempt of attempts) {
    const result = await requestQuestionBatch({
      ...params,
      model: attempt.model,
      timeoutMs: attempt.timeoutMs,
      userPrompt: `${params.userPrompt}${attempt.suffix}`,
    });
    if ("questions" in result) return result.questions;
    lastError = result.error;
    if (!result.retryable) throw new Error(result.error);
  }

  throw new Error(lastError);
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T, index: number) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function distributeMathSpr(totalCount: number, batchCount: number) {
  const targetSpr = Math.round(totalCount * 0.25);
  const perBatch = Array.from({ length: batchCount }, (_, i) => {
    const start = Math.floor((targetSpr * i) / batchCount);
    const end = Math.floor((targetSpr * (i + 1)) / batchCount);
    return end - start;
  });
  return perBatch;
}

// Per-user daily generation cap (each call counts as 1, regardless of question count)
const DAILY_CALL_CAP = 40;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const rawCount = Number(body.count);
    const count = Number.isFinite(rawCount) && rawCount > 0 ? Math.min(Math.floor(rawCount), 60) : 6;
    const allowedModes = new Set(["full", "math", "reading", "redemption"]);
    const mode = allowedModes.has(body.mode) ? body.mode : "full";
    const allowedBias = new Set(["balanced", "easier", "harder"]);
    const difficultyBias = allowedBias.has(body.difficultyBias) ? body.difficultyBias : "balanced";
    const allowedSections = new Set(["Math", "Reading & Writing"]);
    const section = allowedSections.has(body.section) ? body.section : undefined;
    const topic = typeof body.topic === "string" ? body.topic.slice(0, 200) : undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // ------- Mandatory auth + per-user daily cap -------
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt || !SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: authErr } = await admin.auth.getUser(jwt);
    const uid = userData?.user?.id;
    if (authErr || !uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: bumped, error: bumpErr } = await userClient.rpc("bump_ai_usage", {
      _user_id: uid,
      _amount: 1,
    });
    if (!bumpErr && typeof bumped === "number" && bumped > DAILY_CALL_CAP) {
      return new Response(
        JSON.stringify({
          error:
            "Daily AI generation limit reached. Try again tomorrow — this cap keeps free AI credits available for everyone.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const effectiveSection: SectionName | undefined =
      section ?? (mode === "math" ? "Math" : mode === "reading" ? "Reading & Writing" : undefined);
    const batchSizes: number[] = [];
    for (let remaining = count; remaining > 0; remaining -= BATCH_SIZE) {
      batchSizes.push(Math.min(BATCH_SIZE, remaining));
    }
    const sprDistribution = effectiveSection === "Math" || mode === "math"
      ? distributeMathSpr(count, batchSizes.length)
      : batchSizes.map(() => 0);

    const systemPrompt = buildSystemPrompt();
    const batchQuestions = await mapWithConcurrency(batchSizes, BATCH_CONCURRENCY, (batchCount, batchIndex) =>
      generateBatchWithFallback({
        lovableApiKey: LOVABLE_API_KEY,
        systemPrompt,
        userPrompt: buildUserPrompt({
          count: batchCount,
          difficultyBias,
          mode,
          section: effectiveSection,
          topic,
          batchIndex,
          batchCount: batchSizes.length,
          sprCount: sprDistribution[batchIndex] ?? 0,
        }),
      })
    );

    const questions = batchQuestions.flat().slice(0, count);
    if (!questions.length) {
      return new Response(JSON.stringify({ error: "Question generation returned no questions." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
