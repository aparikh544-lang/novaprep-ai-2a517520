import { create } from "zustand";
import {
  INITIAL_MISTAKES,
  MistakeEntry,
  Question,
  QUESTIONS,
  rankFromXP,
} from "./novaprep-data";

interface NovaState {
  xp: number;
  streak: number;
  mistakes: MistakeEntry[];
  recordMistake: (m: MistakeEntry) => void;
  awardXP: (amount: number) => void;
  getQuestionById: (id: string) => Question | undefined;
  rankInfo: () => ReturnType<typeof rankFromXP>;
}

export const useNova = create<NovaState>((set, get) => ({
  xp: 720,
  streak: 6,
  mistakes: INITIAL_MISTAKES,
  recordMistake: (m) => set((s) => ({ mistakes: [m, ...s.mistakes] })),
  awardXP: (amount) => set((s) => ({ xp: s.xp + amount })),
  getQuestionById: (id) => QUESTIONS.find((q) => q.id === id),
  rankInfo: () => rankFromXP(get().xp),
}));
