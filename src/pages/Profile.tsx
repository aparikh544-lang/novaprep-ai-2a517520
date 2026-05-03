import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CalendarDays, Flame, Medal, ShieldCheck, Star, Target, Trophy, UserCircle, Zap, Gem, Clock3, BookOpenCheck, Crown, Timer, Backpack, Sparkles, Snowflake, Rocket, Brain, TrendingUp, ShieldQuestion } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { rankFromXP } from "@/lib/novaprep-data";
import { deriveNovaStats } from "@/lib/novaprep-stats";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const badgeCatalog = [
  // Practice volume
  { name: "First Launch", icon: ShieldCheck, test: (s: any) => s.sessions >= 1, detail: "Complete 1 session" },
  { name: "Consistency Core", icon: Flame, test: (s: any) => s.sessions >= 5, detail: "Complete 5 sessions" },
  { name: "Iron Schedule", icon: CalendarDays, test: (s: any) => s.sessions >= 20, detail: "Complete 20 sessions" },
  { name: "Marathon Mind", icon: Clock3, test: (s: any) => s.hours >= 5, detail: "Log 5 hours of practice" },
  { name: "Endurance Pilot", icon: Rocket, test: (s: any) => s.hours >= 20, detail: "Log 20 hours of practice" },
  // Accuracy / performance
  { name: "Accuracy Ace", icon: Target, test: (s: any) => s.accuracy >= 80, detail: "Reach 80% lifetime accuracy" },
  { name: "Sharpshooter", icon: Target, test: (s: any) => s.accuracy >= 90, detail: "Reach 90% lifetime accuracy" },
  { name: "Perfect Drill", icon: Star, test: (s: any) => s.bestAccuracy === 100, detail: "Score 100% on a session" },
  { name: "Pace Breaker", icon: Clock3, test: (s: any) => s.avgPace > 0 && s.avgPace <= 75, detail: "Average 75 seconds per question or faster" },
  { name: "Score Climber", icon: TrendingUp, test: (s: any) => s.projected >= 1300, detail: "Hit a 1300+ projected score" },
  { name: "Elite Trajectory", icon: Crown, test: (s: any) => s.projected >= 1500, detail: "Hit a 1500+ projected score" },
  // Streak
  { name: "Hot Streak", icon: Flame, test: (s: any) => s.streak >= 3, detail: "Hold a 3-day streak" },
  { name: "Wildfire", icon: Flame, test: (s: any) => s.streak >= 7, detail: "Hold a 7-day streak" },
  { name: "Unbroken", icon: Snowflake, test: (s: any) => s.streak >= 14, detail: "Hold a 14-day streak" },
  // Focus
  { name: "Deep Worker", icon: Timer, test: (s: any) => s.focusMinutes >= 60, detail: "Log 60 focused minutes" },
  { name: "Flow State", icon: Sparkles, test: (s: any) => s.focusMinutes >= 300, detail: "Log 5 hours in Focus mode" },
  // Currency / inventory
  { name: "SP Collector", icon: Gem, test: (s: any) => s.sp >= 50, detail: "Hold 50 SP at once" },
  { name: "SP Tycoon", icon: Gem, test: (s: any) => s.sp >= 250, detail: "Hold 250 SP at once" },
  { name: "Quartermaster", icon: Backpack, test: (s: any) => s.inventory >= 5, detail: "Stockpile 5 inventory items" },
  // Weak areas
  { name: "Vault Cleaner", icon: BookOpenCheck, test: (s: any) => s.mistakes === 0 && s.sessions > 0, detail: "Clear all weak areas" },
  // XP / level
  { name: "XP Pilot", icon: Zap, test: (s: any) => s.xp >= 2500, detail: "Earn 2,500 XP" },
  { name: "XP Veteran", icon: Brain, test: (s: any) => s.xp >= 10000, detail: "Earn 10,000 XP" },
  { name: "Rank Climber", icon: Medal, test: (s: any) => s.level >= 10, detail: "Reach level 10" },
  { name: "Commander Track", icon: Crown, test: (s: any) => s.level >= 30, detail: "Reach level 30" },
  // Setup
  { name: "Early Bird", icon: CalendarDays, test: (s: any) => Boolean(s.testDate), detail: "Set a test date" },
  { name: "Goal Setter", icon: Award, test: (s: any) => Boolean(s.targetScore), detail: "Set a target score" },
];

const Profile = () => {
  const profile = useNova((s) => s.profile);
  const mistakes = useNova((s) => s.mistakes);
  const sessions = useNova((s) => s.sessions);
  const updateProfile = useNova((s) => s.updateProfile);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const xp = profile?.xp ?? 0;
  const rank = rankFromXP(xp);
  const pct = rank.ceiling === rank.floor ? 100 : Math.min(100, ((xp - rank.floor) / (rank.ceiling - rank.floor)) * 100);
  const initials = (profile?.display_name ?? "Nova Pilot").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const stats = useMemo(() => deriveNovaStats(sessions, mistakes, xp, profile?.target_score), [sessions, mistakes, xp, profile?.target_score]);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [targetScore, setTargetScore] = useState(String(profile?.target_score ?? ""));
  const [testDate, setTestDate] = useState(profile?.test_date ?? "");
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const badgeState = { sessions: sessions.length, accuracy: stats.accuracy, bestAccuracy: stats.bestAccuracy, mistakes: mistakes.length, streak: profile?.streak ?? 0, xp, sp: profile?.sp ?? 0, hours: stats.hoursLogged, level: rank.level, targetScore: profile?.target_score, testDate: profile?.test_date, avgPace: stats.avgPace, projected: stats.projectedScore, focusMinutes: profile?.focus_minutes_total ?? 0, inventory: (profile?.inventory ?? []).length };

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setTargetScore(String(profile?.target_score ?? ""));
    setTestDate(profile?.test_date ?? "");
  }, [profile?.display_name, profile?.target_score, profile?.test_date]);

  useEffect(() => {
    // One-time bootstrap: if no admin exists, show claim option
    supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "admin")
      .then(({ count }) => setAdminExists((count ?? 0) > 0));
  }, [isAdmin]);

  const claimAdmin = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    if (error) {
      toast({ title: "Could not claim admin", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Admin access granted", description: "Reload to see admin tabs in the sidebar." });
    setAdminExists(true);
    setTimeout(() => window.location.reload(), 800);
  };

  const save = async () => {
    await updateProfile({ display_name: displayName || null, target_score: targetScore ? Number(targetScore) : null, test_date: testDate || null });
    toast({ title: "Profile synced", description: "Target score and test date updated." });
  };

  return (
    <AppLayout>
      <div className="grid xl:grid-cols-[0.95fr_1.35fr] gap-6 items-start">
        <GlassCard variant="purple" className="overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-display font-bold glow-purple text-primary-foreground">
              {initials || <UserCircle className="h-12 w-12" />}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-secondary">Profile</span>
              <h1 className="font-display text-4xl font-bold mt-1">{profile?.display_name ?? "Nova Pilot"}</h1>
              <p className="text-muted-foreground text-sm mt-1">Level {rank.level} · {rank.rank} {rank.levelInRank}/{rank.levelsInRank} · {xp.toLocaleString()} XP · {(profile?.sp ?? 0).toLocaleString()} SP</p>
            </div>
          </div>
          <div className="mt-8 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} /></div>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{rank.rank}</span><span>Next: {rank.next}</span></div>
        </GlassCard>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <GlassCard><Target className="h-5 w-5 text-secondary" /><div className="mt-3 text-2xl font-display font-bold">{profile?.target_score ?? "—"}</div><p className="text-xs text-muted-foreground">Target score</p></GlassCard>
          <GlassCard><CalendarDays className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-display font-bold">{profile?.test_date ?? "—"}</div><p className="text-xs text-muted-foreground">Test date</p></GlassCard>
          <GlassCard><Star className="h-5 w-5 text-success" /><div className="mt-3 text-2xl font-display font-bold">{stats.accuracy}%</div><p className="text-xs text-muted-foreground">Lifetime accuracy</p></GlassCard>
          <GlassCard><Trophy className="h-5 w-5 text-primary" /><div className="mt-3 text-2xl font-display font-bold">{stats.projectedScore}</div><p className="text-xs text-muted-foreground">Projected score</p></GlassCard>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[0.75fr_1.25fr] gap-6 items-start">
        <GlassCard variant="cyan">
          <h2 className="font-display text-2xl font-semibold">Profile Details</h2>
          <div className="mt-4 space-y-3">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={400} max={1600} value={targetScore} onChange={(e) => setTargetScore(e.target.value)} placeholder="Target score" className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
              <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
            </div>
            <button onClick={save} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save changes</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/boxes" className="inline-flex px-4 py-2 rounded-lg bg-muted border border-border text-sm font-medium">Open mystery boxes</Link>
            <Link to="/help" className="inline-flex px-4 py-2 rounded-lg bg-muted border border-border text-sm font-medium">Help & tour</Link>
          </div>
          {adminExists === false && !isAdmin && (
            <div className="mt-5 rounded-lg border border-warning/40 bg-warning/10 p-4">
              <div className="flex items-center gap-2 text-warning">
                <ShieldQuestion className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Owner setup</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                No admin has claimed this workspace yet. If you are the owner, claim admin access now to unlock the Users and Reviews pages.
              </p>
              <button
                onClick={claimAdmin}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-warning/20 border border-warning/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-warning/30"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Claim admin access
              </button>
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold">Badges</h2>
            <span className="text-xs font-mono text-muted-foreground">
              {badgeCatalog.filter((b) => b.test(badgeState)).length} / {badgeCatalog.length}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badgeCatalog.map((badge) => {
              const unlocked = badge.test(badgeState);
              return (
                <div
                  key={badge.name}
                  className={`group relative rounded-lg border p-3 text-center transition-all ${
                    unlocked
                      ? "border-success/40 bg-success/5"
                      : "border-border/60 bg-muted/20 opacity-60"
                  }`}
                  title={badge.detail}
                >
                  <badge.icon
                    className={`h-6 w-6 mx-auto ${
                      unlocked ? "text-success" : "text-muted-foreground"
                    }`}
                  />
                  <div className="mt-2 text-xs font-medium font-display leading-tight line-clamp-2">
                    {badge.name}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Profile;
