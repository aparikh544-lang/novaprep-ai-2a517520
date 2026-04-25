import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Timer, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const PRESETS = [15, 30, 60];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const Focus = () => {
  const awardFocusXP = useNova((s) => s.awardFocusXP);
  const profile = useNova((s) => s.profile);
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [customMin, setCustomMin] = useState("25");
  const intervalRef = useRef<number | null>(null);
  const startedAtMin = useRef(0);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRunning(false);
          finishSession();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const finishSession = async () => {
    const minutesFocused = startedAtMin.current - Math.ceil(remaining / 60);
    const minutes = Math.max(1, minutesFocused || Math.floor(duration / 60));
    const xp = await awardFocusXP(minutes);
    toast({
      title: "Focus session complete",
      description: `+${xp} XP for ${minutes} focused minutes.`,
    });
  };

  const setPreset = (min: number) => {
    if (running) return;
    setDuration(min * 60);
    setRemaining(min * 60);
  };

  const start = () => {
    if (remaining <= 0) setRemaining(duration);
    startedAtMin.current = Math.ceil((remaining > 0 ? remaining : duration) / 60);
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setRemaining(duration);
  };

  const applyCustom = () => {
    const n = Math.max(1, Math.min(180, Number(customMin) || 25));
    setPreset(n);
  };

  const pct = Math.round(((duration - remaining) / Math.max(1, duration)) * 100);

  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">Deep Work</span>
        <h1 className="font-display text-4xl font-bold mt-1">Focus Timer</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Pomodoro-style timer. Earn <span className="text-secondary font-medium">3 XP per minute</span>{" "}
          you stay focused. Total focus time logged: {profile?.focus_minutes_total ?? 0} minutes.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <GlassCard variant="purple" className="flex flex-col items-center text-center !p-10">
          <div className="relative h-64 w-64">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="url(#focus-grad)"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(pct / 100) * 289} 289`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
              <defs>
                <linearGradient id="focus-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-6xl font-bold tabular-nums">
                {formatTime(remaining)}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                {running ? "Focusing" : remaining === 0 ? "Done" : "Ready"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            {!running ? (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Play className="h-4 w-4" /> Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-6 py-3 text-sm font-medium"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Timer className="h-4 w-4 text-secondary" /> Presets
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => setPreset(m)}
                  disabled={running}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                    duration === m * 60
                      ? "border-primary/50 bg-primary/15 text-primary-glow"
                      : "border-border bg-muted/40 hover:bg-muted"
                  } disabled:opacity-50`}
                >
                  {m} min
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Custom
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
                />
                <button
                  onClick={applyCustom}
                  disabled={running}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="cyan">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" /> XP Reward
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              Each minute focused = <span className="text-secondary font-medium">3 XP</span>. A 60-minute
              session earns 180 XP — even more if you have an active 2x boost.
            </p>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
};

export default Focus;
