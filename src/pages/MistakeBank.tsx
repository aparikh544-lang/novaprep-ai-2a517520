import { useMemo, useState } from "react";
import { Bookmark, Filter, RotateCcw } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { ErrorReason } from "@/lib/novaprep-data";

const reasonStyles: Record<ErrorReason, string> = {
  "Concept Gap": "bg-primary/15 text-primary-glow border-primary/30",
  "Time Pressure": "bg-warning/15 text-warning border-warning/30",
  Misreading: "bg-secondary/15 text-secondary border-secondary/30",
};

const MistakeBank = () => {
  const mistakes = useNova((s) => s.mistakes);
  const getQ = useNova((s) => s.getQuestionById);
  const [filter, setFilter] = useState<"all" | ErrorReason>("all");

  const list = useMemo(
    () => (filter === "all" ? mistakes : mistakes.filter((m) => m.reason === filter)),
    [mistakes, filter]
  );

  const filters: ("all" | ErrorReason)[] = [
    "all",
    "Concept Gap",
    "Time Pressure",
    "Misreading",
  ];

  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">
          The Vault
        </span>
        <h1 className="font-display text-4xl font-bold mt-1">Mistake Bank</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Every wrong answer is auto-tagged with topic, difficulty, and the reason you
          missed it. Re-attempt them in a Redemption Round.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f
                ? "bg-primary/20 text-primary-glow border-primary/40"
                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {list.length === 0 && (
          <GlassCard className="text-center text-muted-foreground py-12">
            <Bookmark className="h-8 w-8 mx-auto mb-3 text-muted-foreground/60" />
            No mistakes in this filter. Keep going, {" "}
            <span className="text-foreground">Cadet</span>.
          </GlassCard>
        )}
        {list.map((m, i) => {
          const q = getQ(m.questionId);
          return (
            <GlassCard key={i} className="!p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${reasonStyles[m.reason]}`}>
                  {m.reason}
                </span>
                <span className="text-xs text-muted-foreground">
                  {m.topic} · <span className="capitalize">{m.difficulty}</span> · {m.timeSpent}s
                </span>
                <button className="ml-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-accent border border-border">
                  <RotateCcw className="h-3 w-3" /> Redrill
                </button>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {q?.prompt ?? "Question removed."}
              </p>
              {q && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-l-2 border-secondary/40 pl-3">
                  <span className="text-secondary font-medium">Coach: </span>
                  {q.explanation}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default MistakeBank;
