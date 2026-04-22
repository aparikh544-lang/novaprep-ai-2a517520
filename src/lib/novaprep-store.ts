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

export interface SessionSummary {
  id: string;
  created_at: string;
  score: number;
  total: number;
  duration_seconds: number;
  mode: string;
  xp_earned: number;
}

export interface TaskCompletion {
  id: string;
  task_key: string;
  task_label: string;
  day_label: string;
  completed_on: string;
}

export interface MysteryBox {
  id: string;
  level_number: number;
  tier: "common" | "rare" | "epic" | "legendary";
  upgrade_clicks_used: number;
  reward_label: string | null;
  opened_at: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface NovaState {
  profile: Profile | null;
  mistakes: MistakeRecord[];
  sessions: SessionSummary[];
  taskCompletions: TaskCompletion[];
  mysteryBoxes: MysteryBox[];
  loading: boolean;
  loadAll: (userId: string) => Promise<void>;
  markTaskComplete: (task: { taskKey: string; taskLabel: string; dayLabel: string }) => Promise<void>;
  syncBoxes: () => Promise<void>;
  upgradeMysteryBox: (boxId: string) => Promise<MysteryBox | null>;
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
  sessions: [],
  taskCompletions: [],
  mysteryBoxes: [],
  loading: false,

  loadAll: async (userId) => {
    set({ loading: true });
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: profile }, { data: mistakes }, { data: sessions }, { data: taskCompletions }, { data: mysteryBoxes }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("mistakes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("sessions")
        .select("id,created_at,score,total,duration_seconds,mode,xp_earned")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("task_completions")
        .select("id,task_key,task_label,day_label,completed_on")
        .eq("user_id", userId)
        .eq("completed_on", today),
      supabase
        .from("mystery_boxes")
        .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,created_at,updated_at")
        .eq("user_id", userId)
        .order("level_number", { ascending: false }),
    ]);
    set({
      profile: profile as Profile | null,
      mistakes: Array.from(new Map((((mistakes as any[]) ?? []) as MistakeRecord[]).map((m) => [m.id, m])).values()),
      sessions: ((sessions as any[]) ?? []) as SessionSummary[],
      taskCompletions: ((taskCompletions as any[]) ?? []) as TaskCompletion[],
      mysteryBoxes: ((mysteryBoxes as any[]) ?? []) as MysteryBox[],
      loading: false,
    });
  },

  markTaskComplete: async ({ taskKey, taskLabel, dayLabel }) => {
    const profile = get().profile;
    if (!profile) return;
    const { data, error } = await supabase
      .from("task_completions")
      .upsert({
        user_id: profile.id,
        task_key: taskKey,
        task_label: taskLabel,
        day_label: dayLabel,
        completed_on: new Date().toISOString().slice(0, 10),
      }, { onConflict: "user_id,task_key,completed_on" })
      .select("id,task_key,task_label,day_label,completed_on")
      .single();
    if (!error && data) {
      set((s) => ({
        taskCompletions: Array.from(new Map([data as TaskCompletion, ...s.taskCompletions].map((item) => [item.task_key, item])).values()),
      }));
    }
  },

  syncBoxes: async () => {
    const profile = get().profile;
    if (!profile) return;
    const levelCount = Math.max(1, Math.floor(profile.xp / 500) + 1);
    const existing = new Set(get().mysteryBoxes.map((box) => box.level_number));
    const missingLevels = Array.from({ length: levelCount }, (_, i) => i + 1).filter((level) => !existing.has(level));
    if (missingLevels.length > 0) {
      await supabase.from("mystery_boxes").insert(
        missingLevels.map((level) => ({
          user_id: profile.id,
          level_number: level,
          tier: "common",
          reward_label: `Level ${level} Mystery Box`,
        })),
      );
    }
    const { data } = await supabase
      .from("mystery_boxes")
      .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,created_at,updated_at")
      .eq("user_id", profile.id)
      .order("level_number", { ascending: false });
    set({ mysteryBoxes: ((data as any[]) ?? []) as MysteryBox[] });
  },

  upgradeMysteryBox: async (boxId) => {
    const box = get().mysteryBoxes.find((entry) => entry.id === boxId);
    if (!box || box.upgrade_clicks_used >= 3) return null;
    const roll = Math.random();
    let nextTier = box.tier;
    if (box.tier === "common" && roll < 0.3) nextTier = "rare";
    else if (box.tier === "rare" && roll < 0.15) nextTier = "epic";
    else if (box.tier === "epic" && roll < 0.05) nextTier = "legendary";

    const { data, error } = await supabase
      .from("mystery_boxes")
      .update({
        tier: nextTier,
        upgrade_clicks_used: box.upgrade_clicks_used + 1,
        opened_at: box.opened_at ?? new Date().toISOString(),
      })
      .eq("id", boxId)
      .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,created_at,updated_at")
      .single();

    if (!error && data) {
      set((s) => ({
        mysteryBoxes: s.mysteryBoxes.map((entry) => (entry.id === boxId ? (data as MysteryBox) : entry)),
      }));
      return data as MysteryBox;
    }
    return null;
  },

  recordMistake: async ({ question, userChoice, timeSpent, reason }) => {
    const profile = get().profile;
    if (!profile) return;
    const existing = get().mistakes.find(
      (m) => m.prompt === question.prompt && m.topic === question.topic && m.user_id === profile.id,
    );
    if (existing) return;
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
      set((s) => ({ mistakes: Array.from(new Map([data as any as MistakeRecord, ...s.mistakes].map((m) => [m.id, m])).values()) }));
    }
  },

  awardXP: async (difficulty) => {
    const profile = get().profile;
    if (!profile) return;
    const newXP = profile.xp + xpForDifficulty(difficulty);
    const { data } = await supabase
      .from("profiles")
      .update({ xp: newXP, streak: Math.max(1, profile.streak || 0) })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) {
      set({ profile: data as Profile });
      await get().syncBoxes();
    }
  },

  recordSession: async ({ mode, score, total, duration, xpEarned }) => {
    const profile = get().profile;
    if (!profile) return;
    const { data } = await supabase.from("sessions").insert({
      user_id: profile.id,
      mode,
      score,
      total,
      duration_seconds: duration,
      xp_earned: xpEarned,
    }).select("id,created_at,score,total,duration_seconds,mode,xp_earned").single();
    const today = new Date().toISOString().slice(0, 10);
    const lastSessionDate = get().sessions[0]?.created_at?.slice(0, 10);
    let nextStreak = profile.streak || 0;
    if (lastSessionDate === today) nextStreak = Math.max(1, nextStreak);
    else if (lastSessionDate) {
      const diff = Math.round((new Date(today).getTime() - new Date(lastSessionDate).getTime()) / 86400000);
      nextStreak = diff === 1 ? nextStreak + 1 : 1;
    } else nextStreak = 1;

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ streak: nextStreak })
      .eq("id", profile.id)
      .select()
      .single();

    set((s) => ({
      sessions: data ? [data as SessionSummary, ...s.sessions] : s.sessions,
      profile: (updatedProfile as Profile) ?? s.profile,
    }));
  },

  resolveMistake: async (id) => {
    const profile = get().profile;
    if (!profile) return;
    const { error } = await supabase.from("mistakes").delete().eq("id", id).eq("user_id", profile.id);
    if (!error) set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) }));
  },

  reset: () => set({ profile: null, mistakes: [], sessions: [], taskCompletions: [], mysteryBoxes: [], loading: false }),
}));
