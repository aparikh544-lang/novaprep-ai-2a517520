import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const scoreData = [
  { week: "W1", score: 1280 },
  { week: "W2", score: 1320 },
  { week: "W3", score: 1360 },
  { week: "W4", score: 1390 },
  { week: "W5", score: 1430 },
  { week: "W6", score: 1480 },
];

const paceData = [
  { topic: "Algebra", sec: 58 },
  { topic: "Quadratics", sec: 84 },
  { topic: "Data", sec: 72 },
  { topic: "Main Idea", sec: 65 },
  { topic: "Inference", sec: 88 },
  { topic: "Grammar", sec: 41 },
];

const Analytics = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">
          Telemetry
        </span>
        <h1 className="font-display text-4xl font-bold mt-1">Analytics</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track your projected score and time-per-question by topic.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard variant="cyan" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Projected Score</h2>
            <span className="text-xs text-success font-mono">+200 / 6 weeks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[1200, 1600]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl font-semibold">Stats</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-mono">82%</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Avg pace</span><span className="font-mono">68s / Q</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Tests taken</span><span className="font-mono">14</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Hours logged</span><span className="font-mono">37.5</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Strongest</span><span className="text-secondary">Grammar</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Weakest</span><span className="text-warning">Inference</span></li>
          </ul>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Time per Question by Topic</h2>
            <span className="text-xs text-muted-foreground">target ≤ 75s</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paceData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="topic" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sec" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Analytics;
