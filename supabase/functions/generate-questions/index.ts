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

// Per-user daily generation cap (each call counts as 1, regardless of question count)
const DAILY_CALL_CAP = 40;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode = "full", count = 6, difficultyBias = "balanced", topic, section } = await req
      .json()
      .catch(() => ({}));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // ------- Per-user daily cap -------
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (jwt && SUPABASE_URL && SERVICE_KEY) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: userData } = await admin.auth.getUser(jwt);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: bumped, error: bumpErr } = await admin.rpc("bump_ai_usage", {
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
      }
    }

    let sectionInstruction = "";
    if (section === "Math") sectionInstruction = "Section must be exactly 'Math'.";
    else if (section === "Reading & Writing") sectionInstruction = "Section must be exactly 'Reading & Writing'.";
    else if (mode === "math") sectionInstruction = "Section must be exactly 'Math'.";
    else if (mode === "reading") sectionInstruction = "Section must be exactly 'Reading & Writing'.";
    else if (mode === "redemption") sectionInstruction = "Use the section that best fits the target topic.";
    else sectionInstruction = "Mix sections roughly evenly between 'Math' and 'Reading & Writing'.";

    let diffInstruction = "";
    if (difficultyBias === "harder") diffInstruction = "Skew difficulty toward 'medium' and 'hard'.";
    else if (difficultyBias === "easier") diffInstruction = "Skew difficulty toward 'easy' and 'medium'.";
    else diffInstruction = "Mix easy/medium/hard.";

    const systemPrompt = `You are an expert SAT tutor creating ORIGINAL SAT-level practice questions only. Never create below-SAT difficulty items, never copy from official material, and never reveal hidden reasoning, chain-of-thought, self-reflection, or internal notes. Topics for Math: ${TOPICS_MATH.join(", ")}. Topics for Reading & Writing: ${TOPICS_RW.join(", ")}. Reading questions must include a short original passage (40-90 words). Reading & Writing questions must be multiple-choice (responseType="multiple-choice"). Math questions should be about 75% multiple-choice and 25% student-produced response (responseType="spr"); SPR items still include 4 plausible choices for storage but MUST also include a concise correctText answer. CRITICAL CLARITY RULES: every question must be 100% self-contained, unambiguous, grammatical, and answerable from the prompt and (if present) the passage alone. Never reference figures, charts, images, tables, or external context. Never ask the student to "select all that apply" — exactly one of the four choices must be correct. If the prompt asks for a numeric answer, the four choices must be distinct numbers; if it asks for a word/phrase, choices must be distinct words/phrases. Re-read each question and confirm a typical SAT student would understand exactly what is being asked. Use plain text only: write fractions as a/b, exponents as x^2, square roots as sqrt(x). Do NOT use LaTeX, markdown, dollar signs, or backslash commands like \\frac or \\sqrt. Double-check that exactly one choice is correct and matches the indicated correct index. Explanations: 1-2 sentences, student-facing, final only.`;

    const topicInstruction = topic ? `Focus every question on this skill/topic: ${topic}.` : "Vary topics.";
    const userPrompt = `Generate ${count} original SAT-style questions. ${sectionInstruction} ${diffInstruction} ${topicInstruction} Keep every question at authentic SAT rigor and crystal clear. Use actual newline characters for multi-line math or passages, never escaped literal \\n text. Return only polished final questions through the tool. Set responseType correctly for each item, and the rendered UI will show choices for "multiple-choice" and a text input for "spr".`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    });

    if (aiResp.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limits exceeded, please try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiResp.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;
    if (!args) throw new Error("No tool call returned");
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify(parsed), {
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
