import { Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";

const lessons = [
  {
    topic: "Systems of Linear Equations",
    summary:
      "Why substitution beats elimination when one variable is already isolated, and how to spot 'no solution' systems instantly.",
    duration: "12 min",
    badge: "Recommended",
  },
  {
    topic: "Inference vs. Main Idea",
    summary:
      "A 3-step framework for separating what the passage states from what it implies — without over-reading.",
    duration: "9 min",
  },
  {
    topic: "Quadratic Vertex Form",
    summary:
      "Convert between standard, factored, and vertex form fluently — and pick the form that answers the question.",
    duration: "14 min",
  },
  {
    topic: "Pacing: 75-Second Discipline",
    summary:
      "How to triage easy/medium/hard questions on a paced module without burning your time bank.",
    duration: "8 min",
  },
];

const AICoach = () => {
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
            <h2 className="font-display text-xl font-semibold">
              Today's Coach Note
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              You missed 2 of the last 3 questions on <span className="text-foreground font-medium">Systems of Linear Equations</span> —
              both involved isolating a variable before substituting. Start with the
              recommended lesson below; we've also queued 4 redrill questions in your Plan.
            </p>
            <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">
              Open recommended lesson <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-4">
        {lessons.map((l, i) => (
          <GlassCard key={i} className="group cursor-pointer hover:scale-[1.01] transition-transform">
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
        ))}
      </div>
    </AppLayout>
  );
};

export default AICoach;
