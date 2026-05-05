import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";

export const coachArticles = [
  {
    slug: "digital-sat-format",
    title: "How the Digital SAT Actually Works",
    duration: "8 min",
    summary: "The exact structure: two adaptive sections, module routing, and how scaled scores are calculated.",
    sections: [
      { heading: "Two sections, two modules each", body: "The Digital SAT has two sections: Reading & Writing and Math. Each section is split into Module 1 and Module 2. Reading & Writing has 27 questions per module (54 total) with 32 minutes per module. Math has 22 questions per module (44 total) with 35 minutes per module. There is a 10-minute break between the two sections. Total test time is about 2 hours and 14 minutes." },
      { heading: "Module 2 adapts to Module 1", body: "After you finish Module 1 in a section, the test scores it instantly and routes you to either an easier or harder Module 2. If you land on the easier Module 2, your section score is capped near 600. The harder Module 2 unlocks the full 200 to 800 range. The cutoff is roughly the upper half of Module 1 performance, though the exact threshold is not published." },
      { heading: "Scaled scoring, not raw correct count", body: "Each section is scored from 200 to 800 in 10-point increments, for a total range of 400 to 1600. The College Board uses Item Response Theory: harder questions you answer correctly contribute more to your scaled score than easier ones. There is no penalty for wrong answers, so you should always fill in something." },
      { heading: "Built-in tools you should use", body: "The testing app includes a calculator (Desmos), a reference sheet of formulas, a question flagger, and an annotation tool for Reading & Writing. Practice using Desmos before test day — it can graph systems, solve equations, and check answers in seconds. The flagger lets you mark questions for review without losing your place." },
    ],
  },
  {
    slug: "ela-question-types",
    title: "Reading & Writing: Every Question Type",
    duration: "12 min",
    summary: "All eight Reading & Writing question types and the exact strategy for each.",
    sections: [
      { heading: "Words in Context", body: "You are given a passage with a blank or an underlined word. Your job is to pick the word whose meaning fits the sentence's logic. Predict your own word first, then match it to the closest choice. Watch for transition words like 'however' or 'because' — they tell you whether the missing word should agree with or contrast with the surrounding ideas." },
      { heading: "Central Ideas and Details", body: "These ask for the main point of a short passage or a specific detail it states. For main idea, the answer must cover the whole passage, not just one sentence. For details, the answer must be directly supported by a specific line — paraphrase, never inference." },
      { heading: "Inferences", body: "The passage gives premises and the question asks what logically follows. The correct answer is the smallest, most cautious step from the evidence. Wrong answers either go too far, contradict the passage, or repeat information without inferring anything new." },
      { heading: "Command of Evidence (Quantitative and Textual)", body: "Quantitative evidence questions show a chart or data summary and ask which choice is supported. Read the units and the title of the table carefully. Textual evidence questions give a claim and ask which quote supports it. The correct quote must directly state the claim, not just relate to the topic." },
      { heading: "Boundaries (Punctuation)", body: "Decide whether each clause is independent or dependent. Two independent clauses need a period, semicolon, or comma + FANBOYS conjunction. A dependent clause attached to an independent clause usually takes a comma. Colons introduce a list, explanation, or quotation that follows an independent clause." },
      { heading: "Form, Structure, and Sense", body: "These test subject-verb agreement, pronoun agreement, verb tense consistency, and modifier placement. Find the subject before choosing the verb. Make sure pronouns have one clear antecedent. An introductory phrase must describe the noun that immediately follows the comma." },
      { heading: "Transitions", body: "The blank needs a transition word that names the logical relationship between the two surrounding ideas. Read the sentence before and the sentence after the blank, decide if they agree, contrast, build cause-effect, or give an example, then pick the matching transition." },
      { heading: "Rhetorical Synthesis", body: "You are given bullet-point notes and a goal (e.g. 'introduce the topic to a new audience'). Pick the sentence that uses the notes to accomplish that exact goal. Eliminate choices that use facts not in the notes or that miss the stated purpose." },
    ],
  },
  {
    slug: "math-domains",
    title: "Math: The Four Domains and What They Test",
    duration: "13 min",
    summary: "Algebra, Advanced Math, Problem-Solving & Data Analysis, Geometry & Trigonometry — what's actually on the test.",
    sections: [
      { heading: "Algebra (about 35% of Math)", body: "Linear equations and inequalities in one or two variables, systems of two linear equations, and linear functions. Know how to solve for a variable, interpret slope and y-intercept in context, and recognize when a system has no solution (parallel lines, same slope different intercepts) or infinite solutions (identical lines)." },
      { heading: "Advanced Math (about 35% of Math)", body: "Quadratic and exponential functions, polynomial expressions, and nonlinear equations. Be fluent in factoring, completing the square, the quadratic formula, and exponent rules. Know that a parabola y = a(x-h)^2 + k has vertex (h, k), and that exponential growth doubles or halves at a constant rate." },
      { heading: "Problem-Solving & Data Analysis (about 15%)", body: "Ratios, proportions, percentages, unit conversions, and reading data from tables, scatterplots, and two-way tables. Probability questions usually reduce to favorable outcomes divided by total outcomes. For percent change, use (new - old) / old × 100." },
      { heading: "Geometry & Trigonometry (about 15%)", body: "Area and volume formulas, angle relationships, the Pythagorean theorem, similar triangles, circle equations (x-h)^2 + (y-k)^2 = r^2, and right-triangle trig (SOH-CAH-TOA). The reference sheet gives you area and volume formulas, but you must know the trig ratios and circle equation by heart." },
    ],
  },
  {
    slug: "math-symbols-cheatsheet",
    title: "Math Notation You'll See on the SAT",
    duration: "6 min",
    summary: "Square root, exponents, fractions, inequalities — exactly how they appear and what they mean.",
    sections: [
      { heading: "Roots and exponents", body: "√x means the non-negative square root of x. ∛x is the cube root. x^2 means x times x; x^(1/2) is the same as √x. Negative exponents flip the base: x^(-2) = 1/x^2. Anything to the power 0 equals 1 (except 0^0, which is undefined)." },
      { heading: "Fractions and ratios", body: "a/b means a divided by b. To compare two fractions, cross-multiply: a/b vs c/d → compare a·d to b·c. A ratio 3:5 means for every 3 of the first quantity there are 5 of the second; the total parts is 8." },
      { heading: "Inequalities", body: "≤ means less than or equal to; ≥ means greater than or equal to. Multiplying or dividing both sides of an inequality by a negative number flips the symbol. ≠ means not equal." },
      { heading: "Functions and intervals", body: "f(x) is the function f evaluated at x. f(3) means substitute 3 for every x. The interval [2, 5] includes both endpoints; (2, 5) excludes them. (-∞, 4] means all numbers up to and including 4." },
      { heading: "Greek letters and constants", body: "π ≈ 3.14159 is the ratio of a circle's circumference to its diameter. θ usually represents an angle. Δ (delta) means 'change in'; Δy/Δx is slope. The absolute value |x| is the distance from x to 0, always non-negative." },
    ],
  },
  {
    slug: "comma-rules",
    title: "Every Comma Rule the SAT Tests",
    duration: "9 min",
    summary: "The five comma situations the test recycles, with examples of each.",
    sections: [
      { heading: "After an introductory element", body: "Use a comma after an opening dependent clause, prepositional phrase, or transition. Examples: 'Although it was raining, we went outside.' / 'In 1969, humans landed on the Moon.' / 'However, the result was unexpected.'" },
      { heading: "Joining two independent clauses with FANBOYS", body: "Two complete sentences can be joined by a comma plus one of for, and, nor, but, or, yet, so. Example: 'She studied for hours, but the test was still hard.' Without the conjunction, you need a period or semicolon — a comma alone creates a comma splice." },
      { heading: "Around non-essential information", body: "If a phrase can be removed without changing the core meaning, surround it with commas (or dashes, or parentheses). Example: 'My brother, who lives in Tokyo, is visiting.' If removing the phrase would change the meaning, do not use commas: 'The student who scored highest got a scholarship.'" },
      { heading: "Between items in a list of three or more", body: "Use commas to separate list items. Example: 'I bought apples, bread, and milk.' The SAT accepts the Oxford comma (the one before 'and'); answer choices will be consistent on this." },
      { heading: "Where commas should NOT appear", body: "Never separate a subject from its verb with a single comma. Never put a comma before a restrictive 'that' clause. Never use a comma between two items joined by 'and' if there are only two items: write 'apples and bread', not 'apples, and bread'." },
    ],
  },
  {
    slug: "quadratics-deep-dive",
    title: "Quadratics: Three Forms, Three Uses",
    duration: "10 min",
    summary: "Standard, factored, and vertex form — when to use each, and the discriminant.",
    sections: [
      { heading: "Standard form: ax^2 + bx + c", body: "Best for reading the y-intercept (it's just c) and for using the quadratic formula x = (-b ± √(b^2 - 4ac)) / (2a). The coefficient a tells you the parabola's direction (a > 0 opens up, a < 0 opens down) and width (larger |a| means narrower)." },
      { heading: "Factored form: a(x - r1)(x - r2)", body: "Best for finding roots (x-intercepts). The roots are exactly r1 and r2. The axis of symmetry is x = (r1 + r2)/2. If a quadratic is given in standard form and asks for roots, try factoring first; if it doesn't factor cleanly, use the quadratic formula." },
      { heading: "Vertex form: a(x - h)^2 + k", body: "Best for finding the minimum or maximum. The vertex is exactly (h, k). If a > 0 then k is the minimum y-value; if a < 0 then k is the maximum. Convert from standard to vertex form by completing the square." },
      { heading: "The discriminant", body: "The expression b^2 - 4ac (under the square root in the quadratic formula) tells you how many real solutions exist. If it's positive, two real solutions. If it's zero, one repeated real solution (the parabola touches the x-axis at the vertex). If negative, no real solutions (the parabola never crosses the x-axis)." },
    ],
  },
  {
    slug: "linear-systems",
    title: "Systems of Linear Equations: Three Outcomes",
    duration: "8 min",
    summary: "How to recognize one solution, no solution, or infinite solutions instantly.",
    sections: [
      { heading: "Compare slopes and intercepts", body: "Rewrite both equations in y = mx + b form. If the slopes differ, there is exactly one solution (the lines cross once). If the slopes are equal but intercepts differ, there is no solution (parallel lines). If both slopes and intercepts are equal, there are infinitely many solutions (same line)." },
      { heading: "Solving by substitution", body: "Solve one equation for one variable, then substitute into the other. Best when one equation already has an isolated variable like y = 2x + 3. Substitute the expression for y into the second equation and solve for x." },
      { heading: "Solving by elimination", body: "Multiply one or both equations so a variable's coefficients are opposites, then add the equations to eliminate it. Best when no variable is already isolated. Example: 2x + 3y = 12 and 4x - 3y = 6 → add directly to get 6x = 18 → x = 3." },
      { heading: "Word problem setup", body: "Define each variable in plain English first ('let x = number of adult tickets'). Translate each sentence into one equation. The most common SAT setup is two equations: a count equation (x + y = total) and a value equation (price1·x + price2·y = total cost)." },
    ],
  },
  {
    slug: "data-and-statistics",
    title: "Data Analysis: Mean, Median, and Spread",
    duration: "8 min",
    summary: "When the mean changes, when it doesn't, and how the SAT tests outliers.",
    sections: [
      { heading: "Mean is sensitive, median is not", body: "The mean (average) is total ÷ count. Adding one very large value pulls the mean up sharply. The median is the middle value when sorted; it ignores how extreme the high and low values are. If a question adds an outlier, the median usually stays close to the same while the mean shifts noticeably." },
      { heading: "Standard deviation = spread", body: "Standard deviation measures how far values typically fall from the mean. A dataset like {10, 10, 10, 10} has standard deviation 0. A dataset like {0, 5, 15, 20} has a much larger standard deviation. The SAT does not ask you to compute it by hand — it asks you to compare two datasets and pick the one with greater or lesser spread." },
      { heading: "Reading two-way tables", body: "Rows and columns represent two different categories. To find a conditional probability ('given that the student is in Group A, what is the probability they chose option X'), divide the cell count by the row total — not the grand total. Read the question stem twice to confirm which total goes in the denominator." },
      { heading: "Margin of error and sampling", body: "A larger sample size produces a smaller margin of error. A random sample from the target population is the only kind that supports generalization. If a survey only sampled one subgroup, the conclusion can only apply to that subgroup, not the whole population." },
    ],
  },
  {
    slug: "test-day-pacing",
    title: "Pacing: Exact Time Per Question",
    duration: "7 min",
    summary: "The math: how many seconds you actually have, and a triage rule that works.",
    sections: [
      { heading: "Reading & Writing: about 71 seconds per question", body: "32 minutes ÷ 27 questions = 71 seconds per question on average. Easy grammar items should take 25 to 40 seconds, leaving extra time for dense inference and rhetorical synthesis questions. If a question takes more than 90 seconds, mark a best guess, flag it, and move on." },
      { heading: "Math: about 95 seconds per question", body: "35 minutes ÷ 22 questions ≈ 95 seconds per question. Use the calculator for arithmetic but not for setup — setting up the equation is what costs time. If the algebra path is unclear after 60 seconds, try plugging in answer choices or substituting a friendly number like x = 2." },
      { heading: "The 60-second triage rule", body: "If you have not made progress on a question after 60 seconds, you are unlikely to solve it without slowing down the rest of the module. Pick the choice that best matches your partial reasoning, flag the question, and continue. Return only after every question has at least a provisional answer." },
      { heading: "Save five minutes for review", body: "Aim to finish the first pass with about five minutes left so you can return to flagged questions. On the digital test, you can navigate freely within a module, so use the question navigator to jump straight to flagged items rather than scrolling." },
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
              <p className="mt-3 text-base leading-8 text-foreground/85 whitespace-pre-line">{section.body}</p>
            </section>
          ))}
          {(() => {
            const closings: Record<string, { title: string; body: string }> = {
              "digital-sat-format": { title: "Why the format matters for your prep", body: "Knowing the structure changes how you study. Because Module 2 difficulty is locked in by Module 1, your first 27 (or 22) questions matter disproportionately — accuracy early is more valuable than speed late. Build that into your practice: treat the first half of every drill as your real performance window." },
              "ela-question-types": { title: "How to use this list", body: "Don't try to master all eight types at once. Pick the two question types you miss most often in NovaPrep's analytics and drill them in isolation for a week. Familiar patterns become fast patterns, and fast patterns are what give you time for the dense inference items at the end." },
              "math-domains": { title: "Where your time goes furthest", body: "Algebra and Advanced Math together are 70% of the math section. If your domain accuracy data shows weakness there, every hour invested returns more points than the same hour spent on geometry edge cases. Audit your last three drills and let the breakdown decide what to study next." },
              "math-symbols-cheatsheet": { title: "Read symbols out loud", body: "When a question stalls you, slow down and read the notation aloud — 'x squared minus four over two' — instead of skimming. Most missed math questions are not algebra failures; they are misreads of a symbol the student rushed past. The cheatsheet only helps if you actually pause to use it." },
              "comma-rules": { title: "Test the comma, don't memorize it", body: "Whenever a punctuation choice appears, mentally remove the words between the commas. If the sentence still reads cleanly, the commas were probably right; if the sentence breaks, the punctuation is wrong. Make that quick deletion test your default move on every Boundaries item." },
              "quadratics-deep-dive": { title: "Match form to question", body: "Before solving anything, look at what the question is asking for and choose the form that exposes that answer directly. Asking for the vertex? Use vertex form. Asking for roots? Use factored form or the quadratic formula. The wrong form turns a 30-second problem into a 3-minute one." },
              "linear-systems": { title: "One classification before you solve", body: "Train yourself to spot 'one solution / no solution / infinite solutions' before you start solving. Many SAT system problems ask exactly that, and a 5-second slope-and-intercept comparison answers it instantly — no substitution or elimination needed." },
              "data-and-statistics": { title: "Always read the question stem twice", body: "Data questions are rarely hard arithmetic — they are reading puzzles disguised as math. The wrong answers usually correspond to using the wrong row total, the wrong column total, or the wrong unit. A 5-second re-read of the stem catches more errors here than a calculator ever will." },
              "test-day-pacing": { title: "Practice pacing before content", body: "If you cannot finish a module in time, raw skill won't show up on your score. Spend at least one timed module per week solely on pacing — finish on time even if accuracy dips slightly — until the clock stops being the dominant variable. Then layer accuracy back on." },
            };
            const closing = closings[article.slug] ?? { title: "Where this fits in your prep", body: "Pick one specific takeaway from this article and apply it to your next NovaPrep drill. After the drill, look at the analytics page to see whether that change moved your accuracy or your time-per-question on the relevant question type. Adjust and repeat — that's how an article becomes a score." };
            return (
              <section className="border-l border-secondary/30 pl-5 py-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-secondary"><CheckCircle2 className="h-4 w-4" /> Closing thought</div>
                <h2 className="font-display text-2xl font-semibold mt-2">{closing.title}</h2>
                <p className="mt-3 text-base leading-8 text-foreground/85">{closing.body}</p>
              </section>
            );
          })()}
        </div>
      </article>
    </AppLayout>
  );
}
