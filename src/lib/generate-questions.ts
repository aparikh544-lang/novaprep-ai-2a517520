import { supabase } from "@/integrations/supabase/client";
import { Question } from "./novaprep-data";

export interface GenerateOptions {
  mode: "full" | "math" | "reading" | "redemption";
  count?: number;
  difficultyBias?: "balanced" | "easier" | "harder";
  topic?: string;
  section?: "Math" | "Reading & Writing";
}

export async function generateQuestions(opts: GenerateOptions): Promise<Question[]> {
  const { data, error } = await supabase.functions.invoke("generate-questions", {
    body: opts,
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  const raw = (data as any)?.questions ?? [];
  return raw.map((q: any, i: number): Question => ({
    id: `${Date.now()}-${i}`,
    section: q.section,
    topic: q.topic,
    difficulty: q.difficulty,
    prompt: q.prompt,
    passage: q.passage || undefined,
    choices: q.choices,
    correct: q.correct,
    explanation: q.explanation,
  }));
}
