// Mock data + simple in-memory state for the NovaPrep prototype.
// AI-generated practice content (originals, no official SAT items).

export type Difficulty = "easy" | "medium" | "hard";
export type Topic =
  | "Systems of Linear Equations"
  | "Quadratics"
  | "Ratios & Rates"
  | "Data Analysis"
  | "Reading: Main Idea"
  | "Reading: Inference"
  | "Grammar: Subject-Verb"
  | "Vocabulary in Context";

export type ErrorReason = "Concept Gap" | "Time Pressure" | "Misreading";

export interface Question {
  id: string;
  section: "Math" | "Reading & Writing";
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  passage?: string;
  choices: string[];
  correct: number; // index
  explanation: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    section: "Math",
    topic: "Systems of Linear Equations",
    difficulty: "medium",
    prompt:
      "If 3x + 2y = 18 and x − y = 1, what is the value of x?",
    choices: ["2", "4", "5", "7"],
    correct: 1,
    explanation:
      "From x − y = 1 → y = x − 1. Substitute: 3x + 2(x − 1) = 18 → 5x − 2 = 18 → x = 4.",
  },
  {
    id: "q2",
    section: "Math",
    topic: "Quadratics",
    difficulty: "hard",
    prompt:
      "The function f(x) = x² − 6x + 11 has its minimum value at which x?",
    choices: ["−3", "0", "3", "6"],
    correct: 2,
    explanation:
      "Vertex of ax² + bx + c is at x = −b/(2a) = 6/2 = 3.",
  },
  {
    id: "q3",
    section: "Math",
    topic: "Ratios & Rates",
    difficulty: "easy",
    prompt:
      "A printer outputs 24 pages every 3 minutes. How many pages in 20 minutes?",
    choices: ["120", "140", "160", "180"],
    correct: 2,
    explanation: "24/3 = 8 pages per minute → 8 × 20 = 160.",
  },
  {
    id: "q4",
    section: "Reading & Writing",
    topic: "Reading: Main Idea",
    difficulty: "medium",
    passage:
      "Marine biologists studying coral resilience have observed that reefs exposed to occasional, brief temperature spikes often recover faster from larger bleaching events than reefs that experience uniformly stable conditions. Researchers hypothesize that intermittent stress may prime corals' cellular defenses.",
    prompt: "Which choice best states the central idea of the passage?",
    choices: [
      "Coral reefs cannot recover from any temperature fluctuation.",
      "Brief, periodic stress may strengthen corals' response to later bleaching.",
      "Stable ocean temperatures are uniformly harmful to coral reefs.",
      "Marine biologists disagree about the causes of coral bleaching.",
    ],
    correct: 1,
    explanation:
      "The passage describes intermittent spikes as potentially priming defenses — choice B captures this central idea.",
  },
  {
    id: "q5",
    section: "Reading & Writing",
    topic: "Grammar: Subject-Verb",
    difficulty: "easy",
    prompt:
      "Choose the option that produces a grammatically correct sentence: 'The collection of rare manuscripts ___ stored in a climate-controlled vault.'",
    choices: ["are", "is", "were", "have been"],
    correct: 1,
    explanation:
      "The subject is 'collection' (singular), so the verb must be 'is'.",
  },
  {
    id: "q6",
    section: "Reading & Writing",
    topic: "Vocabulary in Context",
    difficulty: "medium",
    prompt:
      "As used in the sentence, the word 'novel' most nearly means: 'Her novel approach to traffic modeling reduced commute times by 18%.'",
    choices: ["fictional", "innovative", "lengthy", "complicated"],
    correct: 1,
    explanation: "'Novel' here means innovative/new, not relating to fiction.",
  },
  {
    id: "q7",
    section: "Math",
    topic: "Data Analysis",
    difficulty: "medium",
    prompt:
      "A dataset has mean 50 and a single new value of 80 is added. The new mean of 11 values is closest to:",
    choices: ["50.0", "52.7", "55.0", "58.2"],
    correct: 1,
    explanation:
      "Original sum = 10×50 = 500. New sum = 580. New mean = 580/11 ≈ 52.7.",
  },
  {
    id: "q8",
    section: "Reading & Writing",
    topic: "Reading: Inference",
    difficulty: "hard",
    passage:
      "Although the council publicly endorsed the new transit plan, internal memos reveal a persistent concern about cost overruns that earlier proposals had managed to avoid.",
    prompt: "What can be most reasonably inferred?",
    choices: [
      "The council unanimously supports the new plan without reservations.",
      "Earlier proposals stayed within budget more reliably than this plan is expected to.",
      "Internal memos are typically released to the public.",
      "The transit plan will certainly fail.",
    ],
    correct: 1,
    explanation:
      "The contrast 'although ... endorsed ... persistent concern about cost overruns that earlier proposals had managed to avoid' supports B.",
  },
];

export interface MistakeEntry {
  questionId: string;
  topic: Topic;
  difficulty: Difficulty;
  reason: ErrorReason;
  timeSpent: number; // seconds
  date: string;
}

export const INITIAL_MISTAKES: MistakeEntry[] = [
  {
    questionId: "q2",
    topic: "Quadratics",
    difficulty: "hard",
    reason: "Concept Gap",
    timeSpent: 95,
    date: "2025-04-18",
  },
  {
    questionId: "q8",
    topic: "Reading: Inference",
    difficulty: "hard",
    reason: "Misreading",
    timeSpent: 71,
    date: "2025-04-19",
  },
  {
    questionId: "q7",
    topic: "Data Analysis",
    difficulty: "medium",
    reason: "Time Pressure",
    timeSpent: 110,
    date: "2025-04-20",
  },
];

export type DayFocus = "Concept Fix" | "Time Management" | "Redemption";

export interface DayPlan {
  day: string;
  focus: DayFocus;
  blocks: { duration: number; task: string }[];
}

export const FLIGHT_PLAN: DayPlan[] = [
  {
    day: "Today",
    focus: "Concept Fix",
    blocks: [
      { duration: 20, task: "Concept Lesson — Systems of Linear Equations" },
      { duration: 15, task: "Algebra mistake redrills (4 questions)" },
      { duration: 25, task: "Reading speed sprint — 3 short passages" },
    ],
  },
  {
    day: "Tomorrow",
    focus: "Time Management",
    blocks: [
      { duration: 30, task: "Pacing drill — Math (paced 75s/question)" },
      { duration: 20, task: "Vocab in Context (10 questions)" },
    ],
  },
  {
    day: "Wed",
    focus: "Redemption",
    blocks: [
      { duration: 25, task: "Re-attempt Mistake Bank (Hard tier)" },
      { duration: 20, task: "Inference reading set" },
    ],
  },
  {
    day: "Thu",
    focus: "Concept Fix",
    blocks: [
      { duration: 25, task: "Quadratics deep-dive" },
      { duration: 15, task: "Subject-Verb agreement drill" },
    ],
  },
  {
    day: "Fri",
    focus: "Time Management",
    blocks: [
      { duration: 30, task: "Full Reading & Writing module (paced)" },
    ],
  },
];

export const RANKS = [
  "Cadet",
  "Pilot",
  "Lieutenant",
  "Captain",
  "Commander",
] as const;

export function rankFromXP(xp: number) {
  if (xp < 500) return { rank: "Cadet", next: "Pilot", floor: 0, ceiling: 500 };
  if (xp < 1500) return { rank: "Pilot", next: "Lieutenant", floor: 500, ceiling: 1500 };
  if (xp < 3000) return { rank: "Lieutenant", next: "Captain", floor: 1500, ceiling: 3000 };
  if (xp < 5000) return { rank: "Captain", next: "Commander", floor: 3000, ceiling: 5000 };
  return { rank: "Commander", next: "Commander", floor: 5000, ceiling: 5000 };
}
