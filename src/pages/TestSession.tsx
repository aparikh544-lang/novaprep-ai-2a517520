import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Clock, Flag, X, ChevronRight, Check, Rocket, Loader2 } from "lucide-react";
import { Question, ErrorReason } from "@/lib/novaprep-data";
import { useNova } from "@/lib/novaprep-store";
import { generateQuestions } from "@/lib/generate-questions";
import { toast } from "@/hooks/use-toast";

type Mode = "full" | "reading" | "math" | "redemption";

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const MODULE_SIZE: Record<Mode, number> = { full: 54, reading: 27, math: 22, redemption: 12 };
const MODULE_LIMIT: Record<Mode, number> = { full: 64 * 60, reading: 32 * 60, math: 35 * 60, redemption: 18 * 60 };

const renderText = (text: string) => text.split(/\\n|\n/g).map((line, i) => <span key={i}>{line}{i < text.split(/\\n|\n/g).length - 1 && <br />}</span>);

const TestSession = () => {
  const { mode = "full" } = useParams();
  const m = mode as Mode;
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const recordMistake = useNova((s) => s.recordMistake);
  const awardXP = useNova((s) => s.awardXP);
  const recordSession = useNova((s) => s.recordSession);
  const resolveMistake = useNova((s) => s.resolveMistake);
  const mistakes = useNova((s) => s.mistakes);

  const [module, setModule] = useState<1 | 2>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [sessionTime, setSessionTime] = useState(0);
  const [qStart, setQStart] = useState<number>(Date.now());
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const loadQuestions = async (bias: "balanced" | "easier" | "harder") => {
    setLoading(true);
    try {
      const qs = await generateQuestions({
        mode: m,
        count: MODULE_SIZE[m],
        difficultyBias: bias,
        topic: searchParams.get("topic") ?? undefined,
        section: m === "full" ? (module === 1 ? "Reading & Writing" : "Math") : undefined,
      });
      setQuestions(qs);
    } catch (e: any) {
      toast({
        title: "Question generation failed",
        description: e.message ?? "Please try again",
        variant: "destructive",
      });
      nav("/practice");
    } finally {
      setLoading(false);
      setQStart(Date.now());
    }
  };

  // Initial load
  useEffect(() => {
    loadQuestions("balanced");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

  // Anti-cheat
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("copy", block);
    el.addEventListener("cut", block);
    el.addEventListener("paste", block);
    el.addEventListener("contextmenu", block);
    return () => {
      el.removeEventListener("copy", block);
      el.removeEventListener("cut", block);
      el.removeEventListener("paste", block);
      el.removeEventListener("contextmenu", block);
    };
  }, [loading]);

  // Silent timer
  useEffect(() => {
    if (done || loading) return;
    const t = setInterval(() => setSessionTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done, loading]);

  useEffect(() => {
    setQStart(Date.now());
  }, [idx, module]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="starfield" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          <div className="text-sm text-muted-foreground font-mono">
            Generating original questions…
          </div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) return null;

  const submitAnswer = async (choice: number) => {
    const elapsed = Math.round((Date.now() - qStart) / 1000);
    setAnswers((a) => ({ ...a, [q.id]: choice }));

    if (choice !== q.correct) {
      const reason: ErrorReason =
        elapsed > 90 ? "Time Pressure" : q.section === "Reading & Writing" ? "Misreading" : "Concept Gap";
      await recordMistake({ question: q, userChoice: choice, timeSpent: elapsed, reason });
    } else {
      const sourceMistakeId = q.id.startsWith("redo-") ? q.id.split("-").slice(1, -1).join("-") : null;
      if (sourceMistakeId) await resolveMistake(sourceMistakeId);
      await awardXP(q.difficulty);
      setXpEarned((x) => x + (q.difficulty === "hard" ? 25 : q.difficulty === "medium" ? 15 : 8));
    }
  };

  const finishSession = async (correct: number, total: number) => {
    setDone(true);
    await recordSession({
      mode: m,
      score: correct,
      total,
      duration: sessionTime,
      xpEarned,
    });
  };

  const goNext = async () => {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      return;
    }
    if (m === "full" && module === 1) {
      const correctCount = questions.filter((qq) => answers[qq.id] === qq.correct).length;
      const ratio = correctCount / questions.length;
      const harder = ratio >= 0.6;
      setModule(2);
      setIdx(0);
      setAnswers({});
      setSessionTime(0);
      await loadQuestions(harder ? "harder" : "easier");
      return;
    }
    const correct = Object.entries(answers).filter(([id, a]) => {
      const qq = questions.find((x) => x.id === id);
      return qq && qq.correct === a;
    }).length;
    await finishSession(correct, questions.length);
  };

  if (done) {
    const correct = Object.entries(answers).filter(([id, a]) => {
      const qq = questions.find((x) => x.id === id);
      return qq && qq.correct === a;
    }).length;
    const total = questions.length;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="starfield" />
        <div className="glass glass-purple p-10 max-w-md w-full text-center relative z-10 animate-scale-in">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-purple">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold">Mission Complete</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            You answered <span className="text-foreground font-semibold">{correct}</span> of {total} correctly
            in <span className="font-mono">{fmtTime(sessionTime)}</span>.
          </p>
          <div className="mt-4 text-xs text-secondary">
            +{xpEarned} XP · Mistakes routed to your Vault
          </div>
          <button
            onClick={() => nav("/")}
            className="mt-6 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
          >
            Return to Mission Control
          </button>
        </div>
      </div>
    );
  }

  const answered = answers[q.id] !== undefined;

  return (
    <div ref={wrapRef} className="min-h-screen bg-background text-foreground relative no-select">
      <div className="starfield" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-border/60 backdrop-blur-xl bg-background/60">
          <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-secondary">Focus Mode</div>
              {m === "full" && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border font-mono">
                  Module {module}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {fmtTime(sessionTime)}
              </span>
              <span>{idx + 1} / {questions.length}</span>
              <button onClick={() => nav("/practice")} className="p-1.5 rounded hover:bg-muted" aria-label="Exit">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-0.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </header>

        <div className="flex-1 flex items-start justify-center px-5 py-10">
          <div className="max-w-2xl w-full">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {q.section} · {q.topic} · <span className="capitalize">{q.difficulty}</span>
            </div>
            {q.passage && (
              <div className="glass p-5 mb-5 text-sm leading-relaxed text-foreground/90">{q.passage}</div>
            )}
            <h2 className="font-display text-xl sm:text-2xl font-semibold leading-snug">{q.prompt}</h2>

            <div className="mt-6 space-y-2.5">
              {q.choices.map((c, i) => {
                const isSel = answers[q.id] === i;
                const showResult = answered;
                const isCorrect = i === q.correct;
                return (
                  <button
                    key={i}
                    onClick={() => !answered && submitAnswer(i)}
                    disabled={answered}
                    className={[
                      "w-full text-left px-4 py-3.5 rounded-lg border text-sm transition-all flex items-start gap-3",
                      showResult && isCorrect
                        ? "border-success/60 bg-success/10"
                        : showResult && isSel && !isCorrect
                        ? "border-destructive/60 bg-destructive/10"
                        : isSel
                        ? "border-primary/60 bg-primary/10"
                        : "border-border bg-muted/30 hover:border-secondary/50 hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <span className="font-mono text-xs text-muted-foreground mt-0.5">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{c}</span>
                    {showResult && isCorrect && <Check className="h-4 w-4 text-success" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="mt-5 glass glass-cyan p-4 text-sm text-foreground/90 leading-relaxed animate-fade-in">
                <div className="text-xs text-secondary uppercase tracking-widest mb-1">Coach</div>
                {q.explanation}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-border/60 bg-background/60 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
            <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
              <Flag className="h-3.5 w-3.5" /> Flag
            </button>
            <button
              onClick={goNext}
              disabled={!answered}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold disabled:opacity-40"
            >
              {idx === questions.length - 1
                ? m === "full" && module === 1
                  ? "Begin Module 2"
                  : "Finish"
                : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TestSession;
