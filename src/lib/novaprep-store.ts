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
  sp?: number;
  xp_boost_until?: string | null;
}

export type BoxReward =
  | { type: "sp"; amount: number; label: string }
  | { type: "xp_boost"; multiplier: 2; minutes: number; label: string };

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
  reward_payload?: BoxReward | null;
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
  updateProfile: (patch: Partial<Pick<Profile, "display_name" | "target_score" | "test_date">>) => Promise<void>;
  markTaskComplete: (task: { taskKey: string; taskLabel: string; dayLabel: string }) => Promise<void>;
  syncBoxes: () => Promise<void>;
  upgradeMysteryBox: (boxId: string) => Promise<MysteryBox | null>;
  openMysteryBox: (boxId: string) => Promise<BoxReward | null>;
  buyXPBoost: () => Promise<boolean>;
  recordMistake: (m: {
    question: Question;
    userChoice: number;
    timeSpent: number;
    reason: ErrorReason;
  }) => Promise<void>;
  awardXP: (difficulty: Difficulty) => Promise<number>;
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

const todayDate = () => new Date().toISOString().slice(0, 10);

const dedupeMistakes = (mistakes: MistakeRecord[]) =>
  Array.from(
    new Map(
      mistakes.map((mistake) => [
        `${mistake.section}::${mistake.topic}::${mistake.prompt}`,
        mistake,
      ]),
    ).values(),
  );

const rewardForTier = (tier: MysteryBox["tier"]): BoxReward => {
  const roll = Math.random();
  if (tier === "common") return roll < 0.5 ? { type: "sp", amount: 5, label: "5 SP" } : { type: "xp_boost", multiplier: 2, minutes: 10, label: "2x XP · 10 min" };
  if (tier === "rare") return roll < 0.45 ? { type: "sp", amount: 10, label: "10 SP" } : roll < 0.9 ? { type: "xp_boost", multiplier: 2, minutes: 20, label: "2x XP · 20 min" } : { type: "sp", amount: 20, label: "20 SP" };
  if (tier === "epic") return roll < 0.45 ? { type: "sp", amount: 20, label: "20 SP" } : roll < 0.9 ? { type: "xp_boost", multiplier: 2, minutes: 30, label: "2x XP · 30 min" } : { type: "sp", amount: 40, label: "40 SP" };
  return roll < 0.5 ? { type: "sp", amount: 40, label: "40 SP" } : { type: "xp_boost", multiplier: 2, minutes: 60, label: "2x XP · 1 hr" };
};

export const useNova = create<NovaState>((set, get) => ({
  profile: null,
  mistakes: [],
  sessions: [],
  taskCompletions: [],
  mysteryBoxes: [],
  loading: false,

  loadAll: async (userId) => {
    set({ loading: true });
    const today = todayDate();
    const [profileRes, mistakesRes, sessionsRes, taskCompletionsRes, mysteryBoxesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("mistakes").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      supabase.from("sessions").select("id,created_at,score,total,duration_seconds,mode,xp_earned").eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
      supabase.from("task_completions").select("id,task_key,task_label,day_label,completed_on").eq("user_id", userId).eq("completed_on", today),
      supabase.from("mystery_boxes").select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,reward_payload,created_at,updated_at").eq("user_id", userId).order("level_number", { ascending: false }),
    ]);

    set({
      profile: (profileRes.data as Profile | null) ?? null,
      mistakes: dedupeMistakes(((mistakesRes.data as MistakeRecord[]) ?? [])),
      sessions: (sessionsRes.data as SessionSummary[]) ?? [],
      taskCompletions: (taskCompletionsRes.data as TaskCompletion[]) ?? [],
      mysteryBoxes: (mysteryBoxesRes.data as MysteryBox[]) ?? [],
      loading: false,
    });

    if (profileRes.data) await get().syncBoxes();
  },

  updateProfile: async (patch) => {
    const profile = get().profile;
    if (!profile) return;
    const { data } = await supabase.from("profiles").update(patch).eq("id", profile.id).select().single();
    if (data) set({ profile: data as Profile });
  },

  markTaskComplete: async ({ taskKey, taskLabel, dayLabel }) => {
    const profile = get().profile;
    if (!profile) return;

    const { data, error } = await supabase
      .from("task_completions")
      .upsert(
        {
          user_id: profile.id,
          task_key: taskKey,
          task_label: taskLabel,
          day_label: dayLabel,
          completed_on: todayDate(),
        },
        { onConflict: "user_id,task_key,completed_on" },
      )
      .select("id,task_key,task_label,day_label,completed_on")
      .single();

    if (!error && data) {
      set((state) => ({
        taskCompletions: Array.from(
          new Map([data as TaskCompletion, ...state.taskCompletions].map((item) => [item.task_key, item])).values(),
        ),
      }));
    }
  },

  syncBoxes: async () => {
    const profile = get().profile;
    if (!profile) return;

    const unlockedLevels = Math.max(1, Math.floor(profile.xp / 500) + 1);
    const existingLevels = new Set(get().mysteryBoxes.map((box) => box.level_number));
    const missingLevels = Array.from({ length: unlockedLevels }, (_, index) => index + 1).filter(
      (level) => !existingLevels.has(level),
    );

    if (missingLevels.length > 0) {
      await supabase.from("mystery_boxes").insert(
        missingLevels.map((level) => ({
          user_id: profile.id,
          level_number: level,
          tier: "common" as const,
          reward_label: `Level ${level} Mystery Box`,
        })),
      );
    }

    const { data } = await supabase
      .from("mystery_boxes")
      .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,reward_payload,created_at,updated_at")
      .eq("user_id", profile.id)
      .order("level_number", { ascending: false });

    set({ mysteryBoxes: (data as MysteryBox[]) ?? [] });
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
      })
      .eq("id", boxId)
      .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,reward_payload,created_at,updated_at")
      .single();

    if (!error && data) {
      set((state) => ({
        mysteryBoxes: state.mysteryBoxes.map((entry) => (entry.id === boxId ? (data as MysteryBox) : entry)),
      }));
      return data as MysteryBox;
    }

    return null;
  },

  buyXPBoost: async () => {
    const profile = get().profile;
    if (!profile || (profile.sp ?? 0) < 25) return false;

    const currentBoost = profile.xp_boost_until && new Date(profile.xp_boost_until).getTime() > Date.now()
      ? new Date(profile.xp_boost_until).getTime()
      : Date.now();
    const { data } = await supabase
      .from("profiles")
      .update({ sp: (profile.sp ?? 0) - 25, xp_boost_until: new Date(currentBoost + 15 * 60_000).toISOString() } as any)
      .eq("id", profile.id)
      .select()
      .single();

    if (data) {
      set({ profile: data as Profile });
      return true;
    }
    return false;
  },

  openMysteryBox: async (boxId) => {
    const profile = get().profile;
    const box = get().mysteryBoxes.find((entry) => entry.id === boxId);
    if (!profile || !box || box.reward_payload || box.claimed_at) return null;

    const reward = rewardForTier(box.tier);
    const patch = reward.type === "sp"
      ? { sp: (profile.sp ?? 0) + reward.amount }
      : { xp_boost_until: new Date(Date.now() + reward.minutes * 60_000).toISOString() };

    const [{ data: updatedBox, error }, { data: updatedProfile }] = await Promise.all([
      supabase
      .from("mystery_boxes")
      .update({ reward_payload: reward, opened_at: new Date().toISOString(), claimed_at: new Date().toISOString() } as any)
        .eq("id", boxId)
        .select("id,level_number,tier,upgrade_clicks_used,reward_label,opened_at,claimed_at,reward_payload,created_at,updated_at")
        .single(),
      supabase.from("profiles").update(patch as any).eq("id", profile.id).select().single(),
    ]);

    if (!error && updatedBox) {
      set((state) => ({
        profile: (updatedProfile as Profile) ?? state.profile,
        mysteryBoxes: state.mysteryBoxes.map((entry) => (entry.id === boxId ? (updatedBox as MysteryBox) : entry)),
      }));
      return reward;
    }
    return null;
  },

  recordMistake: async ({ question, userChoice, timeSpent, reason }) => {
    const profile = get().profile;
    if (!profile) return;

    const existing = get().mistakes.find(
      (mistake) =>
        mistake.user_id === profile.id &&
        mistake.section === question.section &&
        mistake.topic === question.topic &&
        mistake.prompt === question.prompt,
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
      set((state) => ({ mistakes: dedupeMistakes([data as MistakeRecord, ...state.mistakes]) }));
    }
  },

  awardXP: async (difficulty) => {
    const profile = get().profile;
    if (!profile) return 0;

    const baseXP = xpForDifficulty(difficulty);
    const boosted = profile.xp_boost_until && new Date(profile.xp_boost_until).getTime() > Date.now();
    const gained = boosted ? baseXP * 2 : baseXP;
    const newXP = profile.xp + gained;
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
    return gained;
  },

  recordSession: async ({ mode, score, total, duration, xpEarned }) => {
    const profile = get().profile;
    if (!profile) return;

    const { data } = await supabase
      .from("sessions")
      .insert({
        user_id: profile.id,
        mode,
        score,
        total,
        duration_seconds: duration,
        xp_earned: xpEarned,
      })
      .select("id,created_at,score,total,duration_seconds,mode,xp_earned")
      .single();

    const today = todayDate();
    const lastSessionDate = get().sessions[0]?.created_at?.slice(0, 10);
    let nextStreak = profile.streak || 0;

    if (lastSessionDate === today) nextStreak = Math.max(1, nextStreak);
    else if (!lastSessionDate) nextStreak = 1;
    else {
      const diffDays = Math.round(
        (new Date(`${today}T00:00:00`).getTime() - new Date(`${lastSessionDate}T00:00:00`).getTime()) / 86400000,
      );
      nextStreak = diffDays === 1 ? nextStreak + 1 : 1;
    }

    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ streak: nextStreak })
      .eq("id", profile.id)
      .select()
      .single();

    set((state) => ({
      sessions: data ? [data as SessionSummary, ...state.sessions] : state.sessions,
      profile: (updatedProfile as Profile) ?? state.profile,
    }));
  },

  resolveMistake: async (id) => {
    const profile = get().profile;
    if (!profile) return;

    const source = get().mistakes.find((mistake) => mistake.id === id);
    if (!source) return;

    const { error } = await supabase
      .from("mistakes")
      .delete()
      .eq("user_id", profile.id)
      .eq("section", source.section)
      .eq("topic", source.topic)
      .eq("prompt", source.prompt);

    if (!error) {
      set((state) => ({
        mistakes: state.mistakes.filter(
          (mistake) =>
            !(
              mistake.user_id === profile.id &&
              mistake.section === source.section &&
              mistake.topic === source.topic &&
              mistake.prompt === source.prompt
            ),
        ),
      }));
    }
  },

  reset: () =>
    set({
      profile: null,
      mistakes: [],
      sessions: [],
      taskCompletions: [],
      mysteryBoxes: [],
      loading: false,
    }),
}));
