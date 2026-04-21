import { useMemo } from "react";
import { Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";

const AICoach = () => {
  const mistakes = useNova((s) => s.mistakes);

  const lessons = useMemo(() => {
    // Build lesson list from real weak topics; recommend the topic with the most mistakes.
    const counts = new Map<string, number>();
    for (const m of mistakes) counts.set(m.topic, (counts.get(m.topic) ?? 0) + 1);
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    if (ranked.length === 0) {
      return [
        {
          topic: "SAT Strategy 101",
          summary: "Pacing, triage, and how to avoid the most common time-traps on Module 1.",
          duration: "10 min",
          badge: "Start here",
        },
        {
          topic: "Reading: 75-Second Discipline",
          summary: "How to triage easy/medium/hard questions on a paced module without burning your time bank.",
          duration: "8 min",
        },
      ];
    }

    return ranked.slice(0, 6).map(([topic, count], i) => ({
      topic,
      summary: `You missed ${count} ${count === 1 ? "question" : "questions"} on this topic. The Coach will walk through the underlying concept and reasoning patterns.`,
      duration: `${8 + Math.min(8, count * 2)} min`,
      badge: i === 0 ? "Recommended" : undefined,
    }));
  }, [mistakes]);

  const dominantReason = useMemo(() => {
    const r = { "Concept Gap": 0, "Time Pressure": 0, Misreading: 0 };
    for (const m of mistakes) r[m.reason]++;
    return Object.entries(r).sort((a, b) => b[1] - a[1])[0];
  }, [mistakes]);

  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">AI Coach</span>
        <h1 className="font-display text-4xl font-bold mt-1">Guided Lessons</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Conceptual deep-dives generated for your weak spots. The Coach explains the
          logic step-by-step — answers come last.
        </p>
      </div>

      <GlassCard variant="purple" className="mb-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-semibold">Today's Coach Note</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {mistakes.length === 0 ? (
                <>Run your first session and the Coach will start tailoring lessons to your weak spots.</>
              ) : (
                <>
                  Your dominant error pattern is{" "}
                  <span className="text-foreground font-medium">{dominantReason[0]}</span> ({dominantReason[1]}{" "}
                  occurrence{dominantReason[1] === 1 ? "" : "s"}). Start with the recommended lesson below.
                </>
              )}
            </p>
            <Link
              to="/practice"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors"
            >
              Begin focused session <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        {lessons.map((l, i) => (
          <Link key={i} to={`/test/redemption?topic=${encodeURIComponent(l.topic)}`} className="block">
          <GlassCard className="group cursor-pointer hover:scale-[1.01] transition-transform h-full">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-secondary text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="font-mono">{l.duration}</span>
              </div>
              {l.badge && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/15 text-primary-glow border border-primary/30">
                  {l.badge}
                </span>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold mt-3">{l.topic}</h3>
            <p className="text-sm text-muted-foreground mt-2">{l.summary}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-secondary group-hover:text-secondary-glow">
              Begin lesson <ChevronRight className="h-4 w-4" />
            </div>
          </GlassCard>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
};

export default AICoach;
