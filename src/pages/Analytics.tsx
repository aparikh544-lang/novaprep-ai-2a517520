import { useEffect, useMemo, useState } from "react";
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
import { useNova } from "@/lib/novaprep-store";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SessionRow {
  created_at: string;
  score: number;
  total: number;
  duration_seconds: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const mistakes = useNova((s) => s.mistakes);
  const profile = useNova((s) => s.profile);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("created_at,score,total,duration_seconds")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => setSessions((data as SessionRow[]) ?? []));
  }, [user, profile?.xp]);

  const scoreData = useMemo(() => {
    if (!sessions.length) {
      return [{ week: "Start", score: 1200 + Math.round((profile?.xp ?? 0) / 12) }];
    }
    return sessions.map((s, i) => {
      const acc = s.total > 0 ? s.score / s.total : 0;
      // Simple projection: 800 baseline + accuracy lift
      const projected = Math.min(1600, Math.round(800 + acc * 800));
      return { week: `S${i + 1}`, score: projected };
    });
  }, [sessions, profile?.xp]);

  const paceData = useMemo(() => {
    const byTopic = new Map<string, { sum: number; n: number }>();
    for (const m of mistakes) {
      const cur = byTopic.get(m.topic) ?? { sum: 0, n: 0 };
      cur.sum += m.time_spent;
      cur.n += 1;
      byTopic.set(m.topic, cur);
    }
    return [...byTopic.entries()]
      .map(([topic, v]) => ({ topic: topic.length > 14 ? topic.slice(0, 12) + "…" : topic, sec: Math.round(v.sum / v.n) }))
      .sort((a, b) => b.sec - a.sec)
      .slice(0, 8);
  }, [mistakes]);

  const totalAnswered = sessions.reduce((a, s) => a + s.total, 0);
  const totalCorrect = sessions.reduce((a, s) => a + s.score, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalSeconds = sessions.reduce((a, s) => a + s.duration_seconds, 0);
  const hoursLogged = (totalSeconds / 3600).toFixed(1);
  const avgPace =
    totalAnswered > 0 ? Math.round(totalSeconds / totalAnswered) : 0;

  const topicStrengths = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of mistakes) counts.set(m.topic, (counts.get(m.topic) ?? 0) + 1);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      weakest: sorted[0]?.[0] ?? "—",
      strongest: sorted.length > 0 ? sorted[sorted.length - 1][0] : "—",
    };
  }, [mistakes]);

  return (
    <AppLayout>
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-secondary">Telemetry</span>
        <h1 className="font-display text-4xl font-bold mt-1">Analytics</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Track your projected score and time-per-question by topic.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <GlassCard variant="cyan" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Projected Score</h2>
            <span className="text-xs text-success font-mono">{sessions.length} sessions</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[800, 1600]} />
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
            <li className="flex justify-between">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-mono">{accuracy}%</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Avg pace</span>
              <span className="font-mono">{avgPace}s / Q</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Tests taken</span>
              <span className="font-mono">{sessions.length}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Hours logged</span>
              <span className="font-mono">{hoursLogged}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Strongest</span>
              <span className="text-secondary truncate ml-2">{topicStrengths.strongest}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Weakest</span>
              <span className="text-warning truncate ml-2">{topicStrengths.weakest}</span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Avg Time on Missed Questions</h2>
            <span className="text-xs text-muted-foreground">target ≤ 75s</span>
          </div>
          {paceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              Take a session to populate pacing data.
            </div>
          ) : (
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
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Analytics;
