import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Brain,
  Clock,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { rankFromXP } from "@/lib/novaprep-data";
import { buildFlightPlan } from "@/lib/flight-plan";

const Dashboard = () => {
  const profile = useNova((s) => s.profile);
  const mistakes = useNova((s) => s.mistakes);
  const xp = profile?.xp ?? 0;
  const streak = profile?.streak ?? 0;
  const info = rankFromXP(xp);
  const plan = useMemo(() => buildFlightPlan(mistakes), [mistakes]);
  const today = plan[0];

  // Simple projected score: baseline 1200 + xp tilt, capped at 1600
  const projected = Math.min(1600, 1200 + Math.round(xp / 12));
  const targetSuffix = profile?.target_score ? ` / ${profile.target_score}` : "";

  return (
    <AppLayout>
      <div className="flex flex-col gap-2 mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">Mission Control</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">
          Welcome back,{" "}
          <span className="text-gradient-nebula">
            {profile?.display_name || info.rank}
          </span>
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Your Flight Plan is calibrated. Today's focus is{" "}
          <span className="text-secondary font-medium">{today.focus}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-warning" />
            Streak
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{streak}d</div>
        </GlassCard>
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            Projected{targetSuffix}
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{projected}</div>
        </GlassCard>
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Bookmark className="h-3.5 w-3.5 text-secondary" />
            Mistake Bank
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{mistakes.length}</div>
        </GlassCard>
        <GlassCard className="!p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Brain className="h-3.5 w-3.5 text-primary" />
            XP
          </div>
          <div className="mt-2 font-display text-3xl font-bold">{xp.toLocaleString()}</div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard variant="purple" className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Today's Routine
              </span>
              <h2 className="font-display text-2xl font-semibold mt-1">{today.focus}</h2>
            </div>
            <Link
              to="/plan"
              className="text-xs text-secondary hover:text-secondary-glow inline-flex items-center gap-1"
            >
              Full plan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {today.blocks.map((b, i) => (
              <li
                key={i}
                className="flex items-center gap-4 p-3 rounded-lg bg-background/40 border border-border/60"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{b.task}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {b.duration} min focused block
                  </div>
                </div>
                <Link
                  to="/practice"
                  className="text-xs px-3 py-1.5 rounded-md bg-primary/15 text-primary-glow border border-primary/30 hover:bg-primary/25 transition-colors"
                >
                  Start
                </Link>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard variant="cyan" className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Launch a session
          </span>
          <h3 className="font-display text-2xl font-semibold mt-1">Full SAT Simulation</h3>
          <p className="text-sm text-muted-foreground mt-2 flex-1">
            Adaptive 2-module sections with silent pacing tracking. Module 2 difficulty
            calibrates to your Module 1 performance.
          </p>
          <Link
            to="/practice"
            className="mt-6 pulse-glow inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold hover:opacity-95 transition-opacity"
          >
            Begin Test <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/practice"
            className="mt-3 text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Or run a 10-minute drill →
          </Link>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
