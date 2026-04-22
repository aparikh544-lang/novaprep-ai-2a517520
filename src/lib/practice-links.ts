import { DayFocus } from "./flight-plan";

export function cleanPracticeTopic(task: string) {
  return task
    .replace(/^Concept Lesson\s*[—-]\s*/i, "")
    .replace(/^Targeted set\s*[—-]\s*/i, "")
    .replace(/^Deep-dive\s*[—-]\s*/i, "")
    .replace(/^Diagnostic:\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/\s*[—-]\s*\d+\s*questions?$/i, "")
    .trim();
}

export function routeForTask(task: string, focus?: DayFocus) {
  const topic = cleanPracticeTopic(task);
  const lower = `${task} ${focus ?? ""}`.toLowerCase();
  const mode = lower.includes("reading") || lower.includes("grammar") || lower.includes("vocab") || lower.includes("passage")
    ? "reading"
    : lower.includes("redemption") || lower.includes("weak")
      ? "redemption"
      : lower.includes("math") || lower.includes("quadratic") || lower.includes("linear") || lower.includes("pacing")
        ? "math"
        : focus === "Time Management"
          ? "reading"
          : focus === "Redemption"
            ? "redemption"
            : "math";

  return `/test/${mode}?topic=${encodeURIComponent(topic)}`;
}