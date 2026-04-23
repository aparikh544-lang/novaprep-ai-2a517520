import { supabase } from "@/integrations/supabase/client";
import { Question } from "./novaprep-data";

export interface GenerateOptions {
  mode: "full" | "math" | "reading" | "redemption";
  count?: number;
  difficultyBias?: "balanced" | "easier" | "harder";
  topic?: string;
  section?: "Math" | "Reading & Writing";
}

const clean = (text?: string) =>
  (text ?? "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/(^|\n)\s*(reasoning|chain of thought|internal thinking)\s*:[\s\S]*/gi, "")
    .replace(/\\n/g, "\n")
    .trim();

export async function generateQuestions(opts: GenerateOptions): Promise<Question[]> {
  const { data, error } = await supabase.functions.invoke("generate-questions", {
    body: opts,
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  const raw = (data as any)?.questions ?? [];
  return raw.map((q: any, i: number): Question => {
    const section = q.section === "Math" ? "Math" : "Reading & Writing";
    const responseType = q.responseType ?? q.response_type ?? (section === "Math" && i % 4 === 3 ? "spr" : "multiple-choice");
    const choices = Array.isArray(q.choices) && q.choices.length === 4 ? q.choices.map(clean) : ["", "", "", ""];
    const correct = Number.isInteger(q.correct) ? q.correct : 0;
    return {
      id: `${Date.now()}-${i}`,
      section,
      topic: q.topic,
      difficulty: q.difficulty,
      prompt: clean(q.prompt),
      passage: clean(q.passage) || undefined,
      choices,
      correct,
      correctText: clean(q.correctText ?? q.correct_text ?? q.correct_answer ?? choices[correct]),
      responseType: responseType === "spr" ? "spr" : "multiple-choice",
      explanation: clean(q.explanation),
    };
  });
}
