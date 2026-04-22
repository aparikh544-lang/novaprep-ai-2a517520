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
  const practiceVolume = Math.min(220, totalAnswered);
  const stabilityBonus = Math.min(80, sessions.length * 6);
  const projectedScore = Math.min(
    targetScore ?? 1600,
    Math.max(980, Math.round(960 + accuracy * 4.2 + practiceVolume * 0.9 + stabilityBonus + xp / 18 - mistakes.length * 6)),
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