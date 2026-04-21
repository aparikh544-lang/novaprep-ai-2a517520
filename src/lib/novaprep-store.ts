import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import {
  MistakeRecord,
  Question,
  Difficulty,
  ErrorReason,
  xpForDifficulty,
} from "./novaprep-data";

interface Profile {
  id: string;
  display_name: string | null;
  target_score: number | null;
  test_date: string | null;
  xp: number;
  streak: number;
}

interface NovaState {
  profile: Profile | null;
  mistakes: MistakeRecord[];
  loading: boolean;
  loadAll: (userId: string) => Promise<void>;
  recordMistake: (m: {
    question: Question;
    userChoice: number;
    timeSpent: number;
    reason: ErrorReason;
  }) => Promise<void>;
  awardXP: (difficulty: Difficulty) => Promise<void>;
  recordSession: (s: {
    mode: string;
    score: number;
    total: number;
    duration: number;
    xpEarned: number;
  }) => Promise<void>;
  resolveMistake: (id: string) => Promise<void>;
  reset: () => void;
}

export const useNova = create<NovaState>((set, get) => ({
  profile: null,
  mistakes: [],
  loading: false,

  loadAll: async (userId) => {
    set({ loading: true });
    const [{ data: profile }, { data: mistakes }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    set({
      profile: profile as Profile | null,
      mistakes: (mistakes as any[] as MistakeRecord[]) ?? [],
      loading: false,
    });
  },

  recordMistake: async ({ question, userChoice, timeSpent, reason }) => {
    const profile = get().profile;
    if (!profile) return;
    const { data, error } = await supabase
      .from("mistakes")
      .insert({
        user_id: profile.id,
        section: question.section,
        topic: question.topic,
        difficulty: question.difficulty,
        reason,
        time_spent: timeSpent,
        prompt: question.prompt,
        passage: question.passage ?? null,
        choices: question.choices,
        correct_index: question.correct,
        user_choice: userChoice,
        explanation: question.explanation,
      })
      .select()
      .single();
    if (!error && data) {
      set((s) => ({ mistakes: [data as any as MistakeRecord, ...s.mistakes] }));
    }
  },

  awardXP: async (difficulty) => {
    const profile = get().profile;
    if (!profile) return;
    const newXP = profile.xp + xpForDifficulty(difficulty);
    const { data } = await supabase
      .from("profiles")
      .update({ xp: newXP })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) set({ profile: data as Profile });
  },

  recordSession: async ({ mode, score, total, duration, xpEarned }) => {
    const profile = get().profile;
    if (!profile) return;
    await supabase.from("sessions").insert({
      user_id: profile.id,
      mode,
      score,
      total,
      duration_seconds: duration,
      xp_earned: xpEarned,
    });
  },

  resolveMistake: async (id) => {
    const { error } = await supabase.from("mistakes").delete().eq("id", id);
    if (!error) set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) }));
  },

  reset: () => set({ profile: null, mistakes: [], loading: false }),
}));
