// Builds a dynamic 5-day Flight Plan from the user's recent mistakes.
import { MistakeRecord } from "./novaprep-data";

export type DayFocus = "Concept Fix" | "Time Management" | "Redemption";

export interface DayPlan {
  day: string;
  focus: DayFocus;
  blocks: { duration: number; task: string }[];
}

const DAY_LABELS = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];

export function buildFlightPlan(mistakes: MistakeRecord[]): DayPlan[] {
  // Tally weak topics & dominant reason
  const topicCount = new Map<string, number>();
  let timePressure = 0;
  let conceptGap = 0;
  let misreading = 0;
  for (const m of mistakes) {
    topicCount.set(m.topic, (topicCount.get(m.topic) ?? 0) + 1);
    if (m.reason === "Time Pressure") timePressure++;
    else if (m.reason === "Concept Gap") conceptGap++;
    else misreading++;
  }
  const weakTopics = [...topicCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);

  const days: DayPlan[] = [];

  // Day 1 (Today): Concept Fix on top weakness, fall back to onboarding
  days.push({
    day: DAY_LABELS[0],
    focus: conceptGap >= timePressure ? "Concept Fix" : "Time Management",
    blocks: weakTopics.length
      ? [
          { duration: 20, task: `Concept Lesson — ${weakTopics[0]}` },
          { duration: 15, task: `Mistake redrills (${Math.min(mistakes.length, 4)} questions)` },
          { duration: 25, task: "Mixed reading sprint — 6 questions" },
        ]
      : [
          { duration: 25, task: "Diagnostic: Math Sprint (10 questions)" },
          { duration: 25, task: "Diagnostic: Reading & Writing Drill" },
        ],
  });

  // Day 2: Time Management drill if user shows pace issues, else mixed
  days.push({
    day: DAY_LABELS[1],
    focus: timePressure > 0 ? "Time Management" : "Concept Fix",
    blocks: [
      { duration: 30, task: "Pacing drill — Math (75s/question)" },
      { duration: 20, task: weakTopics[1] ? `Targeted set — ${weakTopics[1]}` : "Vocab in Context (10 questions)" },
    ],
  });

  // Day 3: Redemption (only if mistakes exist)
  days.push({
    day: DAY_LABELS[2],
    focus: mistakes.length > 0 ? "Redemption" : "Concept Fix",
    blocks:
      mistakes.length > 0
        ? [
            { duration: 25, task: "Re-attempt Mistake Bank (Hard tier)" },
            { duration: 20, task: "Inference reading set" },
          ]
        : [
            { duration: 25, task: "Quadratics deep-dive" },
            { duration: 20, task: "Subject-Verb agreement drill" },
          ],
  });

  // Day 4: Concept Fix on second weakness
  days.push({
    day: DAY_LABELS[3],
    focus: "Concept Fix",
    blocks: [
      { duration: 25, task: weakTopics[2] ? `Deep-dive — ${weakTopics[2]}` : "Linear functions deep-dive" },
      { duration: 15, task: misreading > 0 ? "Slow-read passage drill" : "Grammar drill" },
    ],
  });

  // Day 5: Time Management full module
  days.push({
    day: DAY_LABELS[4],
    focus: "Time Management",
    blocks: [{ duration: 30, task: "Full Reading & Writing module (paced)" }],
  });

  return days;
}
