import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CalendarDays, Flame, Medal, ShieldCheck, Star, Target, Trophy, UserCircle, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { rankFromXP } from "@/lib/novaprep-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const rewards = [
  { name: "Cadet Kit", at: 0, icon: ShieldCheck, reward: "Starter badge" },
  { name: "Pilot Trail", at: 500, icon: Flame, reward: "Animated profile glow" },
  { name: "Lieutenant Crest", at: 1500, icon: Medal, reward: "Gold answer streak badge" },
  { name: "Captain Vault", at: 3000, icon: Trophy, reward: "Elite dashboard frame" },
  { name: "Commander Aurora", at: 5000, icon: Award, reward: "Top-rank cosmic badge" },
];

const Profile = () => {
  const { user } = useAuth();
  const profile = useNova((s) => s.profile);
  const mistakes = useNova((s) => s.mistakes);
  const [sessions, setSessions] = useState<{ score: number; total: number; xp_earned: number }[]>([]);
  const xp = profile?.xp ?? 0;
  const rank = rankFromXP(xp);
  const pct = rank.ceiling === rank.floor ? 100 : Math.min(100, ((xp - rank.floor) / (rank.ceiling - rank.floor)) * 100);
  const initials = (profile?.display_name ?? "Nova Pilot").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const level = Math.floor(xp / 250) + 1;
  const accuracy = useMemo(() => {
    const total = sessions.reduce((a, s) => a + s.total, 0);
    const correct = sessions.reduce((a, s) => a + s.score, 0);
    return total ? Math.round((correct / total) * 100) : 0;
  }, [sessions]);

  useEffect(() => {
    if (!user) return;
    supabase.from("sessions").select("score,total,xp_earned").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setSessions((data as typeof sessions) ?? []));
  }, [user, xp]);

  return (
    <AppLayout>
      <div className="grid xl:grid-cols-[1.1fr_1.4fr] gap-6 items-start">
        <GlassCard variant="purple" className="overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-display font-bold glow-purple text-primary-foreground">
              {initials || <UserCircle className="h-12 w-12" />}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-secondary">Profile</span>
              <h1 className="font-display text-4xl font-bold mt-1">{profile?.display_name ?? "Nova Pilot"}</h1>
              <p className="text-muted-foreground text-sm mt-1">Level {level} · {rank.rank} · {xp.toLocaleString()} XP</p>
            </div>
          </div>
          <div className="mt-8 h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <span>{rank.rank}</span>
            <span>Next: {rank.next}</span>
          </div>
        </GlassCard>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <GlassCard><Target className="h-5 w-5 text-secondary" /><div className="mt-3 text-2xl font-display font-bold">{profile?.target_score ?? "—"}</div><p className="text-xs text-muted-foreground">Target score</p></GlassCard>
          <GlassCard><CalendarDays className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-display font-bold">{profile?.test_date ?? "—"}</div><p className="text-xs text-muted-foreground">Test date</p></GlassCard>
          <GlassCard><Flame className="h-5 w-5 text-warning" /><div className="mt-3 text-2xl font-display font-bold">{mistakes.length}</div><p className="text-xs text-muted-foreground">Skills to clear</p></GlassCard>
          <GlassCard><Star className="h-5 w-5 text-success" /><div className="mt-3 text-2xl font-display font-bold">{accuracy}%</div><p className="text-xs text-muted-foreground">Lifetime accuracy</p></GlassCard>
          <GlassCard><Zap className="h-5 w-5 text-secondary" /><div className="mt-3 text-2xl font-display font-bold">{sessions.length}</div><p className="text-xs text-muted-foreground">Sessions completed</p></GlassCard>
          <GlassCard><Trophy className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-display font-bold">{rewards.filter((r) => xp >= r.at).length}/{rewards.length}</div><p className="text-xs text-muted-foreground">Rewards unlocked</p></GlassCard>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
        <GlassCard variant="cyan">
          <h2 className="font-display text-2xl font-semibold">Next Reward</h2>
          <p className="text-sm text-muted-foreground mt-2">Earn XP from correct answers to unlock profile cosmetics and status badges.</p>
          <Link to="/practice" className="mt-5 inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Earn XP</Link>
        </GlassCard>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rewards.map((r) => {
          const unlocked = xp >= r.at;
          return (
            <GlassCard key={r.name} className={unlocked ? "border-success/40" : "opacity-60"}>
              <r.icon className={unlocked ? "h-6 w-6 text-success" : "h-6 w-6 text-muted-foreground"} />
              <h3 className="font-display font-semibold mt-4">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{r.reward}</p>
              <div className="mt-4 text-[11px] font-mono text-secondary">{unlocked ? "UNLOCKED" : `${r.at - xp} XP LEFT`}</div>
            </GlassCard>
          );
        })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;