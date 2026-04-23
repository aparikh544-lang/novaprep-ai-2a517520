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
  const targetAnchor = targetScore ? Math.min(80, Math.max(0, (targetScore - 1200) / 5)) : 35;
  const mastery = totalAnswered > 0 ? (totalCorrect / Math.max(1, totalAnswered)) * Math.min(260, totalAnswered) : 0;
  const projectedScore = Math.min(
    1600,
    Math.max(900, Math.round(980 + mastery * 1.05 + practiceVolume * 0.45 + stabilityBonus + xp / 28 + targetAnchor - mistakes.length * 9)),
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