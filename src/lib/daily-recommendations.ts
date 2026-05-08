// Generates today's AI-recommended practice plan from the user's weak skills.
// No multi-day flight plan; just a focused daily routine.
import { MistakeRecord } from "./novaprep-data";
import { SessionSummary } from "./novaprep-store";

export interface DailyTask {
  task: string;
  duration: number;
  topic: string;
  section: "Math" | "Reading & Writing" | "Mixed";
  reason: string;
  mode: "math" | "reading" | "redemption" | "review" | "full";
}

export interface DailyRoutine {
  headline: string;
  subline: string;
  focus: "Concept Fix" | "Time Management" | "Redemption" | "Maintenance";
  tasks: DailyTask[];
}

const sectionForTopic = (topic: string): DailyTask["section"] => {
  const lower = topic.toLowerCase();
  if (/(read|grammar|vocab|passage|inference|punct|transition|verb|pronoun|modifier)/.test(lower))
    return "Reading & Writing";
  if (/(math|alg|geom|quadratic|linear|function|equation|ratio|stat|probab)/.test(lower))
    return "Math";
  return "Mixed";
};

// Cache today's routine in localStorage so completed tasks don't vanish when
// underlying mistake counts change mid-day.
const ROUTINE_KEY = "novaprep:daily-routine";
const ROUTINE_VERSION = 2;
const todayStr = () => new Date().toISOString().slice(0, 10);

function loadCachedRoutine(): DailyRoutine | null {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.date === todayStr() && parsed?.version === ROUTINE_VERSION && parsed?.routine) return parsed.routine as DailyRoutine;
  } catch {}
  return null;
}
function saveCachedRoutine(routine: DailyRoutine) {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify({ date: todayStr(), version: ROUTINE_VERSION, routine }));
  } catch {}
}

export function buildDailyRoutine(
  mistakes: MistakeRecord[],
  sessions: SessionSummary[],
): DailyRoutine {
  const cached = loadCachedRoutine();
  if (cached) return cached;
  const result = buildDailyRoutineInner(mistakes, sessions);
  saveCachedRoutine(result);
  return result;
}

function buildDailyRoutineInner(
  mistakes: MistakeRecord[],
  sessions: SessionSummary[],
): DailyRoutine {
  const topicCount = new Map<string, { count: number; section: string }>();
  let timePressure = 0;
  let conceptGap = 0;

  for (const m of mistakes) {
    const cur = topicCount.get(m.topic) ?? { count: 0, section: m.section };
    cur.count += 1;
    topicCount.set(m.topic, cur);
    if (m.reason === "Time Pressure") timePressure += 1;
    if (m.reason === "Concept Gap") conceptGap += 1;
  }

  const ranked = [...topicCount.entries()].sort((a, b) => b[1].count - a[1].count);
  const recentSession = sessions[0];
  const recentAccuracy = recentSession ? recentSession.score / Math.max(1, recentSession.total) : null;

  const tasks: DailyTask[] = [];
  let focus: DailyRoutine["focus"] = "Maintenance";
  let headline = "Today's Recommended Plan";
  let subline = "A short, focused routine generated from your latest performance.";

  if (ranked.length === 0) {
    focus = "Maintenance";
    headline = "Build a Baseline";
    subline = "We need a few sessions to learn your weak spots — start with a balanced warm-up.";
    tasks.push(
      {
        task: "Diagnostic — Math Sprint",
        duration: 70,
        topic: "Mixed Math",
        section: "Math",
        reason: "Establish a baseline for algebra & data analysis pacing.",
        mode: "math",
      },
      {
        task: "Diagnostic — Reading & Writing",
        duration: 64,
        topic: "Mixed RW",
        section: "Reading & Writing",
        reason: "Calibrate inference, grammar, and transition accuracy.",
        mode: "reading",
      },
    );
    return { headline, subline, focus, tasks };
  }

  if (conceptGap >= timePressure) {
    focus = "Concept Fix";
    headline = "Patch Your Weakest Concepts";
    subline = `Your last sessions show recurring gaps in ${ranked[0][0]}. Today targets those directly.`;
  } else {
    focus = "Time Management";
    headline = "Tighten Your Pacing";
    subline = `Time pressure is your dominant error pattern. Today focuses on fast-recall drills.`;
  }

  const top = ranked[0];
  tasks.push({
    task: `Concept Drill — ${top[0]}`,
    duration: sectionForTopic(top[0]) === "Math" ? 70 : 32,
    topic: top[0],
    section: sectionForTopic(top[0]),
    reason: `You missed ${top[1].count} ${top[1].count === 1 ? "question" : "questions"} on this topic recently.`,
    mode: sectionForTopic(top[0]) === "Math" ? "math" : "reading",
  });

  if (ranked[1]) {
    const second = ranked[1];
    tasks.push({
      task: `Targeted Set — ${second[0]}`,
      duration: sectionForTopic(second[0]) === "Math" ? 70 : 32,
      topic: second[0],
      section: sectionForTopic(second[0]),
      reason: `Secondary weakness — ${second[1].count} recent miss${second[1].count === 1 ? "" : "es"}.`,
      mode: sectionForTopic(second[0]) === "Math" ? "math" : "reading",
    });
  }

  if (timePressure > 0) {
    tasks.push({
      task: "Pacing Sprint — 75s/Q",
      duration: 18,
      topic: "Pacing",
      section: "Mixed",
      reason: `${timePressure} timed-out misses detected. Build pace muscle memory.`,
      mode: "math",
    });
  }

  if (recentAccuracy !== null && recentAccuracy >= 0.85 && mistakes.length < 3) {
    tasks.push({
      task: "Stretch Set — Hard Tier",
      duration: 18,
      topic: "Mixed Hard",
      section: "Mixed",
      reason: "You're outperforming your level. Try harder problems to push your score ceiling.",
      mode: "redemption",
    });
  }

  return { headline, subline, focus, tasks };
}

export function dailyTaskKey(task: DailyTask) {
  return `today::${task.task}`.toLowerCase().replace(/\s+/g, " ").trim();
}

export function routeForDailyTask(task: DailyTask) {
  const params = new URLSearchParams({ topic: task.topic, day: "Today", task: task.task });
  return `/test/${task.mode}?${params.toString()}`;
}
