import { MistakeRecord } from "./novaprep-data";
import { SessionSummary } from "./novaprep-store";

export function deriveNovaStats(sessions: SessionSummary[], mistakes: MistakeRecord[], xp: number, targetScore?: number | null) {
  const totalAnswered = sessions.reduce((sum, session) => sum + session.total, 0);
  const totalCorrect = sessions.reduce((sum, session) => sum + session.score, 0);
  const totalSeconds = sessions.reduce((sum, session) => sum + session.duration_seconds, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const avgPace = totalAnswered > 0 ? Math.round(totalSeconds / totalAnswered) : 0;
  const hoursLogged = Number((totalSeconds / 3600).toFixed(1));
  const bestAccuracy = sessions.length
    ? Math.max(...sessions.map((session) => Math.round((session.score / Math.max(1, session.total)) * 100)))
    : 0;
  const weeklyXP = sessions.slice(0, 7).reduce((sum, session) => sum + session.xp_earned, 0);
  const fullTests = sessions.filter((session) => session.mode === "full");
  const fullAnswered = fullTests.reduce((sum, session) => sum + session.total, 0);
  const fullCorrect = fullTests.reduce((sum, session) => sum + session.score, 0);
  const reliableAnswered = fullAnswered >= 60 ? fullAnswered : totalAnswered;
  const reliableCorrect = fullAnswered >= 60 ? fullCorrect : totalCorrect;
  const reliableAccuracy = reliableAnswered > 0 ? reliableCorrect / reliableAnswered : 0.52;
  const volumeBonus = Math.min(95, Math.sqrt(Math.max(0, totalAnswered)) * 7);
  const xpBonus = Math.min(80, xp / 45);
  const penalty = Math.min(120, mistakes.length * 5);
  const targetAnchor = targetScore ? Math.min(45, Math.max(-25, (targetScore - 1200) / 12)) : 0;
  const projectedScore = Math.round(
    Math.min(1550, Math.max(850, 900 + reliableAccuracy * 430 + volumeBonus + xpBonus + targetAnchor - penalty)),
  );

  return {
    totalAnswered,
    totalCorrect,
    totalSeconds,
    accuracy,
    avgPace,
    hoursLogged,
    bestAccuracy,
    weeklyXP,
    projectedScore,
  };
}
