import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";

export const coachArticles = [
  {
    slug: "sat-strategy-101",
    title: "SAT Strategy 101",
    duration: "10 min",
    summary: "Pacing, triage, and how to avoid the most common traps.",
    sections: [
      { heading: "Win the easy points first", body: "Treat every module like a point hunt. Move quickly through questions you can solve cleanly, flag time-heavy questions, and return only after your reliable points are secured." },
      { heading: "Use two-pass pacing", body: "Your first pass should collect straightforward questions and eliminate obvious wrong answers. Your second pass is for calculation-heavy math, dense reading, or choices that are very close." },
      { heading: "Do not chase perfection early", body: "One stubborn question can cost three easier ones. If you are not making progress after about 60–75 seconds, pick your best provisional answer, flag it, and move." },
    ],
  },
  {
    slug: "75-second-discipline",
    title: "Reading: 75-Second Discipline",
    duration: "8 min",
    summary: "A practical timing system for Reading & Writing questions.",
    sections: [
      { heading: "Read for job, not vibes", body: "Before reading choices, identify what the question is asking you to prove: main idea, evidence, grammar, transition, inference, or vocabulary-in-context." },
      { heading: "Predict before comparing", body: "Write a tiny mental prediction. The correct answer usually matches the role or meaning you predicted, while traps sound related but do a different job." },
      { heading: "Cut extreme or unsupported choices", body: "On SAT reading, wrong choices often add claims the passage never makes. If a choice needs outside assumptions, remove it." },
    ],
  },
  {
    slug: "math-no-calculator-mindset",
    title: "Math: Faster Algebra Moves",
    duration: "9 min",
    summary: "Use structure, substitution, and answer choices to reduce calculation load.",
    sections: [
      { heading: "Look for structure", body: "Before expanding, ask whether factoring, symmetry, or substitution reveals the answer faster. SAT math rewards clean transformations over brute force." },
      { heading: "Backsolve strategically", body: "When choices are numeric and equations are simple, test middle values first. Eliminate choices by checking which ones satisfy the original conditions." },
      { heading: "Track units and signs", body: "Many hard questions are missed because of sign changes, percent units, or rate units. Label quantities before solving." },
    ],
  },
  {
    slug: "grammar-patterns",
    title: "Grammar Patterns That Repeat",
    duration: "7 min",
    summary: "The punctuation and sentence-boundary checks that show up constantly.",
    sections: [
      { heading: "Independent clauses matter", body: "If both sides can stand alone, use a period, semicolon, or comma plus coordinating conjunction. A lone comma creates a comma splice." },
      { heading: "Modifiers must point clearly", body: "Introductory phrases should describe the subject that immediately follows. If they do not, the sentence is usually wrong." },
      { heading: "Keep tense and number consistent", body: "Match verbs to subjects and keep tense shifts justified by the timeline of the sentence." },
    ],
  },
  {
    slug: "last-week-plan",
    title: "Last-Week SAT Game Plan",
    duration: "6 min",
    summary: "What to do in the final week before test day.",
    sections: [
      { heading: "Review patterns, not everything", body: "Use your missed-question topics to choose review blocks. Do not randomly study every skill equally in the final week." },
      { heading: "Protect sleep and timing", body: "A tired brain loses more points than a missing formula. Keep sessions timed, but avoid exhausting full tests right before test day." },
      { heading: "Make a guessing plan", body: "Decide ahead of time how you will flag, skip, and return. A calm routine prevents panic when time is tight." },
    ],
  },
];

export default function CoachArticle() {
  const { slug } = useParams();
  const article = coachArticles.find((item) => item.slug === slug) ?? coachArticles[0];

  return (
    <AppLayout>
      <Link to="/coach" className="mb-6 inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary-glow"><ArrowLeft className="h-4 w-4" /> Back to Coach</Link>
      <GlassCard variant="purple" className="mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30"><BookOpen className="h-6 w-6 text-secondary" /></div>
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-secondary">Coach Article · {article.duration}</span>
            <h1 className="font-display text-4xl font-bold mt-2">{article.title}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">{article.summary}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-4">
        {article.sections.map((section) => (
          <GlassCard key={section.heading}>
            <div className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-success" />
              <div><h2 className="font-display text-xl font-semibold">{section.heading}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p></div>
            </div>
          </GlassCard>
        ))}
      </div>
    </AppLayout>
  );
}
