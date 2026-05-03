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
  const profile = useNova((s) => s.profile);
  const focusTimer = useNova((s) => s.focusTimer);
  const setFocusDuration = useNova((s) => s.setFocusDuration);
  const startFocusTimer = useNova((s) => s.startFocusTimer);
  const pauseFocusTimer = useNova((s) => s.pauseFocusTimer);
  const resetFocusTimer = useNova((s) => s.resetFocusTimer);
  const completeFocusTimer = useNova((s) => s.completeFocusTimer);
  const [, force] = useState(0);
  const [customMin, setCustomMin] = useState(String(Math.floor(focusTimer.duration / 60)));
  const completingRef = useRef(false);

  // Compute live remaining from store (so background tabs/other pages stay accurate)
  const remaining = focusTimer.running && focusTimer.endsAt
    ? Math.max(0, Math.round((focusTimer.endsAt - Date.now()) / 1000))
    : focusTimer.remaining;

  useEffect(() => {
    if (!focusTimer.running) return;
    const t = window.setInterval(() => force((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, [focusTimer.running]);

  useEffect(() => {
    if (focusTimer.running && remaining <= 0 && !completingRef.current) {
      completingRef.current = true;
      const minutes = Math.max(1, Math.floor(focusTimer.duration / 60));
      completeFocusTimer().then((xp) => {
        toast({
          title: "Focus session complete",
          description: `+${xp} XP for ${minutes} focused minutes.`,
        });
        completingRef.current = false;
      });
    }
  }, [remaining, focusTimer.running, focusTimer.duration, completeFocusTimer]);

  const setPreset = (min: number) => {
    if (focusTimer.running) return;
    setFocusDuration(min * 60);
    setCustomMin(String(min));
  };

  const applyCustom = () => {
    const n = Math.max(1, Math.min(180, Number(customMin) || 25));
    setPreset(n);
  };

  const pct = Math.round(((focusTimer.duration - remaining) / Math.max(1, focusTimer.duration)) * 100);

  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">Deep Work</span>
        <h1 className="font-display text-4xl font-bold mt-1">Focus Timer</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Pomodoro-style timer. Earn <span className="text-secondary font-medium">3 XP per minute</span>{" "}
          you stay focused. The timer keeps running even if you switch tabs or pages. Total focus time
          logged: {profile?.focus_minutes_total ?? 0} minutes.
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
                {focusTimer.running ? "Focusing" : remaining === 0 ? "Done" : "Ready"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            {!focusTimer.running ? (
              <button
                onClick={startFocusTimer}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                <Play className="h-4 w-4" /> Start
              </button>
            ) : (
              <button
                onClick={pauseFocusTimer}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
            )}
            <button
              onClick={resetFocusTimer}
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
                  disabled={focusTimer.running}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                    focusTimer.duration === m * 60
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
                  disabled={focusTimer.running}
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
