import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Clock, Flag, X, ChevronRight, Rocket, Loader2, AlertTriangle } from "lucide-react";
import { Question, ErrorReason } from "@/lib/novaprep-data";
import { useNova } from "@/lib/novaprep-store";
import { generateQuestions } from "@/lib/generate-questions";
import { sanitizeMath } from "@/lib/sanitize-math";
import { toast } from "@/hooks/use-toast";
import { taskCompletionKey } from "@/lib/practice-links";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Mode = "full" | "reading" | "math" | "redemption" | "review";
type AnswerValue = number | string;

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const MODULE_SIZE: Record<Mode, number> = { full: 54, reading: 27, math: 22, redemption: 12, review: 10 };
const MODULE_LIMIT: Record<Mode, number> = { full: 64 * 60, reading: 32 * 60, math: 35 * 60, redemption: 18 * 60, review: 15 * 60 };

const textLines = (text: string) => sanitizeMath(text).split("\n");
const renderText = (text: string) => textLines(text).map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>);
const normalizeSPR = (value: AnswerValue | undefined) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
const isCorrectAnswer = (q: Question, answer: AnswerValue | undefined) => {
  if (answer === undefined) return false;
  if (q.responseType === "spr") return normalizeSPR(answer) === normalizeSPR(q.correctText ?? q.choices[q.correct]);
  return answer === q.correct;
};
const answerIndex = (q: Question, answer: AnswerValue | undefined) => typeof answer === "number" ? answer : q.correct;

const TestSession = () => {
  const { mode = "full" } = useParams();
  const m = mode as Mode;
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const recordMistake = useNova((s) => s.recordMistake);
  const awardXP = useNova((s) => s.awardXP);
  const recordSession = useNova((s) => s.recordSession);
  const resolveMistake = useNova((s) => s.resolveMistake);
  const markTaskComplete = useNova((s) => s.markTaskComplete);
  const mistakes = useNova((s) => s.mistakes);
  const requestedTopic = searchParams.get("topic") ?? undefined;
  const taskLabel = searchParams.get("task") ?? undefined;
  const dayLabel = searchParams.get("day") ?? undefined;
  const weakTopic = requestedTopic ?? mistakes[0]?.topic;

  const [module, setModule] = useState<1 | 2>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [sessionTime, setSessionTime] = useState(0);
  const [qStart, setQStart] = useState<number>(Date.now());
  const [timeByQuestion, setTimeByQuestion] = useState<Record<string, number>>({});
  const [reviewing, setReviewing] = useState(false);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [completed, setCompleted] = useState({ correct: 0, total: 0, seconds: 0, xp: 0 });
  const [exitOpen, setExitOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const currentLimit = m === "full" ? (module === 1 ? 64 * 60 : 70 * 60) : MODULE_LIMIT[m];
  const exerciseName =
    m === "full" ? "Full SAT Simulation" :
    m === "reading" ? "Reading & Writing drill" :
    m === "math" ? "Math drill" :
    m === "redemption" ? "Weak-area redemption drill" :
    "Mistake review";

  const cleanExplanation = (text: string) =>
    text
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/(^|\n)\s*(reasoning|chain of thought|internal thinking)\s*:[\s\S]*/gi, "")
      .replace(/\\n/g, "\n")
      .trim();

  const stampTime = () => {
    const elapsed = Math.round((Date.now() - qStart) / 1000);
    const current = questions[idx];
    if (current) setTimeByQuestion((prev) => ({ ...prev, [current.id]: (prev[current.id] ?? 0) + elapsed }));
  };

  const prepareQuestions = (qs: Question[], targetModule: 1 | 2): Question[] => qs.map((question, index): Question => ({
    ...question,
    responseType: question.section === "Math" && index % 4 === 3 ? "spr" : "multiple-choice",
    choices: question.section === "Math" && index % 4 === 3 ? question.choices : question.choices,
    explanation: cleanExplanation(question.explanation),
  }));

  const loadQuestions = async (bias: "balanced" | "easier" | "harder", targetModule = module) => {
    setLoading(true);
    try {
      if (m === "review" && mistakes.length > 0) {
        const reviewSource = requestedTopic
          ? mistakes.filter((mi) => mi.topic.toLowerCase() === requestedTopic.toLowerCase())
          : mistakes;
        setQuestions((reviewSource.length ? reviewSource : mistakes).slice(0, MODULE_SIZE.review).map((mi, i): Question => ({
          id: `redo:${mi.id}:${i}`,
          section: mi.section as any,
          topic: mi.topic,
          difficulty: mi.difficulty,
          prompt: mi.prompt,
          passage: mi.passage ?? undefined,
          choices: mi.choices,
          correct: mi.correct_index,
          responseType: "multiple-choice",
          correctText: mi.choices[mi.correct_index],
          explanation: cleanExplanation(mi.explanation ?? ""),
        })));
      } else {
        const fullSection = targetModule === 1 ? "Reading & Writing" : "Math";
        const modeTopic = requestedTopic && requestedTopic !== "Mixed SAT Skills" ? requestedTopic : undefined;
        const qs = await generateQuestions({
          mode: m === "review" ? "redemption" : m,
          count: m === "full" ? (targetModule === 1 ? 54 : 44) : MODULE_SIZE[m],
          difficultyBias: bias,
          topic: m === "redemption" ? weakTopic : modeTopic,
          section: m === "full" ? fullSection : undefined,
        });
        setQuestions(prepareQuestions(qs, targetModule as 1 | 2));
      }
    } catch (e: any) {
      toast({ title: "Question generation failed", description: e.message ?? "Please try again", variant: "destructive" });
      nav("/practice");
    } finally {
      setLoading(false);
      setQStart(Date.now());
    }
  };

  useEffect(() => {
    loadQuestions("balanced");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m]);

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

  useEffect(() => {
    if (done || loading || reviewing) return;
    const t = setInterval(() => setSessionTime((s) => Math.min(s + 1, currentLimit)), 1000);
    return () => clearInterval(t);
  }, [done, loading, reviewing, currentLimit]);

  useEffect(() => {
    if (!loading && !done && sessionTime >= currentLimit) setReviewing(true);
  }, [sessionTime, loading, done, currentLimit]);

  useEffect(() => {
    setQStart(Date.now());
  }, [idx, module]);

  const gradeCurrentModule = async () => {
    let correct = 0;
    let gained = 0;
    for (const qq of questions) {
      const answer = answers[qq.id];
      if (isCorrectAnswer(qq, answer)) {
        correct += 1;
        const sourceMistakeId = qq.id.startsWith("redo:") ? qq.id.split(":")[1] : null;
        if (sourceMistakeId) await resolveMistake(sourceMistakeId);
        gained += await awardXP(qq.difficulty);
      } else if (answer !== undefined) {
        const elapsed = timeByQuestion[qq.id] ?? Math.round(sessionTime / Math.max(1, questions.length));
        const reason: ErrorReason = elapsed > 90 ? "Time Pressure" : qq.section === "Reading & Writing" ? "Misreading" : "Concept Gap";
        await recordMistake({ question: qq, userChoice: answerIndex(qq, answer), timeSpent: elapsed, reason });
      }
    }
    setXpEarned((x) => x + gained);
    return { correct, gained };
  };

  const finishSession = async (correct: number, total: number, gained: number) => {
    setDone(true);
    await recordSession({
      mode: m,
      score: correct + completed.correct,
      total: total + completed.total,
      duration: sessionTime + completed.seconds,
      xpEarned: xpEarned + completed.xp + gained,
    });
    if (taskLabel && dayLabel) await markTaskComplete({ taskKey: taskCompletionKey(dayLabel, taskLabel), taskLabel, dayLabel });
  };

  const proceedSubmit = async () => {
    stampTime();
    setReviewing(false);
    const result = await gradeCurrentModule();
    if (m === "full" && module === 1) {
      const harder = result.correct / questions.length >= 0.6;
      setCompleted({ correct: result.correct, total: questions.length, seconds: sessionTime, xp: result.gained });
      setModule(2);
      setIdx(0);
      setAnswers({});
      setFlagged(new Set());
      setTimeByQuestion({});
      setSessionTime(0);
      await loadQuestions(harder ? "harder" : "easier", 2);
      return;
    }
    await finishSession(result.correct, questions.length, result.gained);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="starfield" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          <div className="text-sm text-muted-foreground font-mono">Generating original questions…</div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  if (!q) return null;

  const answered = answers[q.id] !== undefined && String(answers[q.id]).trim() !== "";
  const answeredCount = questions.filter((qq) => answers[qq.id] !== undefined && String(answers[qq.id]).trim() !== "").length;
  const moduleAction = m === "full" && module === 1 ? "Submit ELA Module" : m === "full" ? "Submit Test" : "Submit Drill";

  if (done) {
    const correct = questions.filter((qq) => isCorrectAnswer(qq, answers[qq.id])).length;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="starfield" />
        <div className="glass glass-purple p-10 max-w-md w-full text-center relative z-10 animate-scale-in">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 glow-purple">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold">Mission Complete</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            You answered <span className="text-foreground font-semibold">{correct + completed.correct}</span> of {questions.length + completed.total} correctly in <span className="font-mono">{fmtTime(sessionTime + completed.seconds)}</span>.
          </p>
          <div className="mt-4 text-xs text-secondary">+{xpEarned + completed.xp} XP · Mistakes routed to your Vault</div>
          <button onClick={() => nav("/")} className="mt-6 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold">Return to Mission Control</button>
        </div>
      </div>
    );
  }

  if (reviewing) {
    return (
      <div className="min-h-screen bg-background text-foreground relative no-select">
        <div className="starfield" />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-5">
          <div className="glass glass-purple max-w-3xl w-full p-6 animate-scale-in">
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="h-5 w-5 text-warning mt-1" />
              <div>
                <h1 className="font-display text-2xl font-bold">Review before submitting</h1>
                <p className="text-sm text-muted-foreground mt-1">Flagged questions are marked. Choose a number to revisit it, or proceed to turn it in.</p>
              </div>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-11 gap-2">
              {questions.map((qq, i) => {
                const hasAnswer = answers[qq.id] !== undefined && String(answers[qq.id]).trim() !== "";
                const isFlagged = flagged.has(qq.id);
                return (
                  <button key={qq.id} onClick={() => { setIdx(i); setReviewing(false); }} className={`relative h-11 rounded-lg border text-sm font-mono transition-colors ${hasAnswer ? "bg-primary/15 border-primary/40" : "bg-muted/20 border-border"}`}>
                    {i + 1}
                    {isFlagged && <Flag className="absolute -right-1 -top-1 h-3.5 w-3.5 text-warning fill-warning" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button onClick={() => setReviewing(false)} className="px-5 py-2.5 rounded-lg border border-border bg-muted/30 text-sm font-medium">Go back</button>
              <button onClick={proceedSubmit} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">Proceed to turn it in</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="min-h-screen bg-background text-foreground relative no-select">
      <div className="starfield" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-border/60 backdrop-blur-xl bg-background/60">
          <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-secondary">Focus Mode</div>
              {m === "full" && <span className="text-xs px-2 py-0.5 rounded bg-muted border border-border font-mono">{module === 1 ? "ELA" : "Math"}</span>}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {fmtTime(Math.max(0, currentLimit - sessionTime))}</span>
              <span>{idx + 1} / {questions.length}</span>
              <button onClick={() => setExitOpen(true)} className="p-1.5 rounded hover:bg-muted" aria-label="Exit"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="h-0.5 bg-muted"><div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
        </header>

        <div className="flex-1 flex items-start justify-center px-5 py-10">
          <div className="max-w-2xl w-full">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{q.section} · {q.topic} · <span className="capitalize">{q.difficulty}</span>{q.responseType === "spr" ? " · Student-produced response" : ""}</div>
            {q.passage && <div className="glass p-5 mb-5 text-sm leading-relaxed text-foreground/90">{renderText(q.passage)}</div>}
            <h2 className="font-display text-xl sm:text-2xl font-semibold leading-snug">{renderText(q.prompt)}</h2>

            {q.responseType === "spr" ? (
              <div className="mt-6 glass p-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Your answer</label>
                <input value={String(answers[q.id] ?? "")} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} inputMode="decimal" className="mt-2 w-full rounded-lg border border-border bg-background/50 px-4 py-3 font-mono text-lg outline-none focus:border-primary" placeholder="Enter a number or fraction" />
              </div>
            ) : (
              <div className="mt-6 space-y-2.5">
                {q.choices.map((c, i) => {
                  const isSel = answers[q.id] === i;
                  return (
                    <button key={i} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))} className={["w-full text-left px-4 py-3.5 rounded-lg border text-sm transition-all flex items-start gap-3", isSel ? "border-primary/60 bg-primary/10" : "border-border bg-muted/30 hover:border-secondary/50 hover:bg-muted/50"].join(" ")}>
                      <span className="font-mono text-xs text-muted-foreground mt-0.5">{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1">{renderText(c)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t border-border/60 bg-background/60 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
            <button onClick={() => setFlagged((prev) => { const next = new Set(prev); next.has(q.id) ? next.delete(q.id) : next.add(q.id); return next; })} className={`text-xs inline-flex items-center gap-1.5 ${flagged.has(q.id) ? "text-warning" : "text-muted-foreground hover:text-foreground"}`}>
              <Flag className={`h-3.5 w-3.5 ${flagged.has(q.id) ? "fill-warning" : ""}`} /> Flag
            </button>
            <div className="flex items-center gap-2">
              {idx > 0 && <button onClick={() => { stampTime(); setIdx(idx - 1); }} className="px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-sm font-medium">Back</button>}
              {idx === questions.length - 1 ? (
                <button onClick={() => { stampTime(); setReviewing(true); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">{moduleAction}<ChevronRight className="h-4 w-4" /></button>
              ) : (
                <button onClick={() => { stampTime(); setIdx(idx + 1); }} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold">Next<ChevronRight className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        </footer>
      </div>
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you really want to exit this session?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose all your progress and XP for this {exerciseName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep going</AlertDialogCancel>
            <AlertDialogAction onClick={() => nav("/practice")}>Yes, exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestSession;
