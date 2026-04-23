import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";

export const coachArticles = [
  {
    slug: "sat-strategy-101",
    title: "SAT Strategy 101",
    duration: "14 min",
    summary: "A full test-day framework for pacing, triage, answer prediction, and recovery.",
    sections: [
      { heading: "Treat the SAT like a point economy", body: "The SAT rewards students who can separate reliable points from tempting time traps. Your goal is not to prove you can solve every question in order; your goal is to collect the most points before the clock runs out. Start each module by moving decisively through questions whose path is clear. If a question needs multiple rereads, a long algebra setup, or a comparison between very similar answers, mark it and keep moving. That single decision protects the easier points that often appear later in the module. A strong tester is not the person who never skips; it is the person who skips intentionally and returns with time." },
      { heading: "Use a two-pass system", body: "On the first pass, answer questions where you can identify the task quickly and eliminate traps confidently. Your second pass is for flagged questions, dense passages, multi-step math, or grammar items where two choices both sound possible. The key is to avoid emotional attachment to any one problem. If you are stuck after about 60 to 75 seconds, make a provisional selection, flag it, and move. When you return, your brain often sees the structure more clearly because it has had time away from the problem." },
      { heading: "Predict before you compare choices", body: "Most wrong answers are designed to sound familiar. They borrow words from the passage, use a true statement that answers the wrong question, or perform one step of math correctly before drifting. Before reading the choices, state what the answer must do. For reading, identify whether the question asks for main idea, evidence, inference, function, vocabulary, or transition. For math, identify the target quantity and units. A rough prediction keeps you from being pulled toward choices that merely look related." },
      { heading: "Build a recovery routine", body: "Every student loses focus at some point during a long exam. The difference is how quickly you recover. If panic rises, pause for one breath, reread the question stem only, and name the task in plain English. Then either solve the next step or flag and move. Do not review your emotional state during the module; review questions. Confidence comes from having a repeatable routine that works even when a question feels unfamiliar." },
    ],
  },
  {
    slug: "75-second-discipline",
    title: "Reading: 75-Second Discipline",
    duration: "12 min",
    summary: "A practical timing and elimination method for Reading & Writing questions.",
    sections: [
      { heading: "Read for the job", body: "A Reading & Writing question is not asking you to admire the passage; it is asking you to perform a specific job. Before looking at choices, classify the task. Is it asking for the main claim, a detail, a logical inference, a transition, punctuation, sentence placement, or vocabulary in context? This classification determines what evidence matters. Students lose time when they reread the entire passage with no purpose. Instead, reread only the line or sentence that performs the job the question names." },
      { heading: "Spend time where it pays", body: "A useful target is about 75 seconds per question, but that does not mean every question gets exactly 75 seconds. Some grammar questions should take 20 to 35 seconds. Some dense inference questions may deserve closer to 90 seconds. The discipline is knowing when additional time is producing evidence and when it is only producing doubt. If you have reread the same sentence twice and cannot explain why an answer is correct, choose the best supported option, flag it, and protect the rest of the module." },
      { heading: "Eliminate by evidence, not vibes", body: "Wrong answers often fail in predictable ways: they are too broad, too extreme, outside the passage, half-right but mismatched to the question, or grammatically clean but logically wrong. When two choices are close, ask which one is easier to prove from the text. The correct answer usually requires the fewest assumptions. If a choice needs you to add a fact, infer an attitude not shown, or ignore the sentence’s purpose, remove it." },
      { heading: "Grammar has repeatable signals", body: "For grammar and expression questions, look for sentence boundaries, subject-verb agreement, pronoun clarity, modifier placement, and logical transitions. Independent clauses need proper punctuation. Modifiers should point to the noun they describe. Transition words must match the relationship between ideas, not just sound academic. These patterns repeat so often that practicing them as checks is faster than reading every answer choice by ear." },
    ],
  },
  {
    slug: "math-no-calculator-mindset",
    title: "Math: Faster Algebra Moves",
    duration: "13 min",
    summary: "Use structure, substitution, and answer checks to reduce calculation load.",
    sections: [
      { heading: "Look for structure before expanding", body: "SAT math often rewards recognition more than computation. Before expanding expressions or solving systems the long way, ask whether factoring, symmetry, substitution, or graph behavior reveals the answer. A quadratic may be easier to solve from its intercepts. A system may be easier after adding equations. A percent question may become simple once you define the original amount as 100. The fastest path usually begins with naming the structure." },
      { heading: "Use answer choices strategically", body: "Multiple-choice math gives you information. When choices are numeric, test a middle value or use estimation to remove impossible options. When the question asks for an expression, plug in a convenient number and compare results. This is not guessing; it is a valid problem-solving method. The trap is testing choices carelessly without checking the original condition. Always verify in the equation or scenario given, not in a transformed version you might have changed incorrectly." },
      { heading: "Student-produced responses require precision", body: "For grid-in style questions, your answer must be exact enough to match the required value. Track units, signs, and whether the question asks for x, y, a rate, a total, or a difference. Many misses happen after the hard work is already done because the student reports the wrong quantity. Before entering the answer, reread the final phrase of the question and make sure your value answers that phrase directly." },
      { heading: "Avoid arithmetic tunnels", body: "If your work becomes a long chain of arithmetic, pause and ask whether there is a cleaner route. Could you divide by a common factor, use a ratio table, graph the relationship mentally, or substitute a simple value? The SAT is timed, so elegant shortcuts matter. Practice reviewing solved problems not just for correctness, but for efficiency: what clue indicated the shorter path?" },
    ],
  },
  {
    slug: "grammar-patterns",
    title: "Grammar Patterns That Repeat",
    duration: "11 min",
    summary: "The punctuation, modifiers, and transition checks that show up constantly.",
    sections: [
      { heading: "Sentence boundaries are the foundation", body: "The most common grammar errors involve joining clauses incorrectly. An independent clause can stand as a full sentence. Two independent clauses cannot be joined by a comma alone. Use a period, semicolon, colon when appropriate, or a comma plus a coordinating conjunction. When you identify the clauses first, punctuation questions become mechanical instead of subjective." },
      { heading: "Modifiers must attach cleanly", body: "Introductory phrases should describe the subject that immediately follows. If the sentence begins with a description of a scientist, the next noun should be that scientist, not the experiment or discovery. Misplaced modifiers often sound fancy but create impossible meanings. Read the opening phrase and ask, who or what is doing this action? The answer should appear right after the comma." },
      { heading: "Transitions show relationships", body: "Transition questions test logic. Do not choose a transition because it sounds smooth; choose it because it names the relationship between ideas. Continuation uses words like moreover or similarly. Contrast uses however or nevertheless. Cause and effect uses therefore or consequently. Example uses for instance. Read the sentence before and after the blank, then label the relationship before checking choices." },
      { heading: "Consistency beats style", body: "The SAT usually prefers clear, consistent writing over dramatic phrasing. Verb tense should match the timeline. Pronouns should refer to obvious nouns. Lists should use parallel structure. If an answer choice creates a shift in number, tense, or point of view without a reason, it is probably wrong. Train yourself to notice what changed between choices; the tested issue is usually inside that change." },
    ],
  },
  {
    slug: "last-week-plan",
    title: "Last-Week SAT Game Plan",
    duration: "10 min",
    summary: "How to review, rest, and make decisions in the final week before test day.",
    sections: [
      { heading: "Review patterns, not everything", body: "The final week is not for rebuilding your entire foundation. It is for sharpening the patterns that cost you points most often. Use your mistake bank to identify two or three recurring issues, then practice targeted sets. Random practice can feel productive while spreading your attention too thin. Focused review lets you convert known weaknesses into predictable points." },
      { heading: "Protect energy", body: "A tired brain makes careless errors, rereads slowly, and panics faster. In the final week, keep sessions timed but not exhausting. Do not take a full test the night before. Instead, review formulas, grammar rules, pacing routines, and a few representative mistakes. Sleep is not separate from preparation; it is part of score performance." },
      { heading: "Set your guessing and flagging rules", body: "Decide before test day how you will handle uncertainty. For example: if no path appears after 60 seconds, eliminate what you can, choose a provisional answer, flag it, and move. If two answers remain, pick the one with stronger textual or mathematical support. Pre-deciding this routine prevents a hard question from becoming an emotional event." },
      { heading: "Warm up, do not burn out", body: "On test morning, solve a few easy-to-medium questions to wake up your process, not to prove your ability. Avoid checking brand-new hard material that could shake confidence. Your goal is to enter the test calm, alert, and ready to execute the routines you practiced." },
    ],
  },
];

export default function CoachArticle() {
  const { slug } = useParams();
  const article = coachArticles.find((item) => item.slug === slug) ?? coachArticles[0];

  return (
    <AppLayout>
      <Link to="/coach" className="mb-6 inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary-glow"><ArrowLeft className="h-4 w-4" /> Back to Coach</Link>
      <article className="mx-auto max-w-3xl">
        <GlassCard variant="purple" className="mb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30"><BookOpen className="h-6 w-6 text-secondary" /></div>
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-secondary">Coach Article · {article.duration}</span>
              <h1 className="font-display text-4xl font-bold mt-2 leading-tight">{article.title}</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground text-lg leading-relaxed">{article.summary}</p>
            </div>
          </div>
        </GlassCard>
        <div className="space-y-5">
          {article.sections.map((section, index) => (
            <section key={section.heading} className="border-l border-secondary/30 pl-5 py-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary"><CheckCircle2 className="h-4 w-4" /> Part {index + 1}</div>
              <h2 className="font-display text-2xl font-semibold mt-2">{section.heading}</h2>
              <p className="mt-3 text-base leading-8 text-foreground/85">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </AppLayout>
  );
}
