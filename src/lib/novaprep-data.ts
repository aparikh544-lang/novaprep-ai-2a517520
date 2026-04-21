// Type definitions and helpers — no mock content. All practice questions are
// generated live by the `generate-questions` edge function.

export type Difficulty = "easy" | "medium" | "hard";
export type ErrorReason = "Concept Gap" | "Time Pressure" | "Misreading";
export type Section = "Math" | "Reading & Writing";

export interface Question {
  id: string;
  section: Section;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  passage?: string;
  choices: string[];
  correct: number;
  explanation: string;
}

export interface MistakeRecord {
  id: string;
  user_id: string;
  section: string;
  topic: string;
  difficulty: Difficulty;
  reason: ErrorReason;
  time_spent: number;
  prompt: string;
  passage: string | null;
  choices: string[];
  correct_index: number;
  user_choice: number | null;
  explanation: string | null;
  created_at: string;
}

export const RANKS = ["Cadet", "Pilot", "Lieutenant", "Captain", "Commander"] as const;

export function rankFromXP(xp: number) {
  if (xp < 500) return { rank: "Cadet", next: "Pilot", floor: 0, ceiling: 500 };
  if (xp < 1500) return { rank: "Pilot", next: "Lieutenant", floor: 500, ceiling: 1500 };
  if (xp < 3000) return { rank: "Lieutenant", next: "Captain", floor: 1500, ceiling: 3000 };
  if (xp < 5000) return { rank: "Captain", next: "Commander", floor: 3000, ceiling: 5000 };
  return { rank: "Commander", next: "Commander", floor: 5000, ceiling: 5000 };
}

export function xpForDifficulty(d: Difficulty) {
  return d === "hard" ? 25 : d === "medium" ? 15 : 8;
}
