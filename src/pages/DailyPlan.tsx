import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, Flame, Brain, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { buildFlightPlan, DayFocus } from "@/lib/flight-plan";
import { routeForTask } from "@/lib/practice-links";

const focusMeta: Record<DayFocus, { color: string; icon: any; desc: string }> = {
  "Concept Fix": {
    color: "text-primary border-primary/40 bg-primary/10",
    icon: Brain,
    desc: "Targeted lesson + drills on a knowledge gap.",
  },
  "Time Management": {
    color: "text-secondary border-secondary/40 bg-secondary/10",
    icon: Clock,
    desc: "Paced drills to improve your time-per-question.",
  },
  Redemption: {
    color: "text-warning border-warning/40 bg-warning/10",
    icon: Flame,
    desc: "Re-attempt past mistakes, fully remixed.",
  },
};

const DailyPlan = () => {
  const mistakes = useNova((s) => s.mistakes);
  const plan = useMemo(() => buildFlightPlan(mistakes), [mistakes]);

  return (
    <AppLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-secondary">Flight Plan</span>
          <h1 className="font-display text-4xl font-bold mt-1">Your 5-Day Route</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            The plan recalibrates after every test. Failed topics schedule a Concept Lesson
            for the next day.
          </p>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-muted hover:bg-accent border border-border">
          <RefreshCw className="h-3.5 w-3.5" /> Recalibrate
        </button>
      </div>

      <div className="space-y-4">
        {plan.map((day, i) => {
          const meta = focusMeta[day.focus];
          const Icon = meta.icon;
          return (
            <GlassCard key={i} className="!p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="md:w-44">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {day.day}
                  </div>
                  <div
                    className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${meta.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {day.focus}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    {meta.desc}
                  </p>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {day.blocks.map((b, j) => (
                    <Link
                      key={j}
                      to={routeForTask(b.task, day.focus)}
                      className="p-3 rounded-lg bg-background/40 border border-border/60 hover:border-secondary/50 hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-[11px] font-mono text-secondary">{b.duration} MIN</div>
                      <div className="text-sm mt-1 font-medium leading-snug">{b.task}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default DailyPlan;
