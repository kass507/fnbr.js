import type {
  TournamentsResponse,
  ResolvedScoreLocation,
  TemplateContext
} from '../../resources/httpResponses';


function resolveTemplate(template: string, ctx: TemplateContext): string {
  return template
    .replace(/\$\{eventId\}/g, ctx.eventId)
    .replace(/\$\{windowId\}/g, ctx.windowId)
    .replace(/\$\{round\}/g, String(ctx.round));
}


export function resolveScoreLocation(
  scoreLocation: { leaderboardDefId?: string; isMainWindowLeaderboard?: boolean },
  tournaments: TournamentsResponse,
  ctx: TemplateContext,
  windowKey: string
): ResolvedScoreLocation {
  const result: ResolvedScoreLocation = {
    leaderboardDefId: scoreLocation.leaderboardDefId ?? '',
    isMainWindowLeaderboard: scoreLocation.isMainWindowLeaderboard ?? false,
  };

  if (!scoreLocation.leaderboardDefId) return result;

  const leaderboardDef = tournaments.leaderboardDefs?.find(
    (def) => def.leaderboardDefId === scoreLocation.leaderboardDefId
  );

  if (!leaderboardDef) return result;

  result.leaderboardDef = leaderboardDef;

  result.leaderboardEventId = resolveTemplate(
    leaderboardDef.leaderboardInstanceGroupingKeyFormat,
    ctx
  );
  result.leaderboardEventWindowId = resolveTemplate(
    leaderboardDef.leaderboardInstanceIdFormat,
    ctx
  );

  if (leaderboardDef.scoringRuleSetId && tournaments.scoringRuleSets) {
    const resolvedScoringId = resolveTemplate(leaderboardDef.scoringRuleSetId, ctx);
    result.scoringRuleSetId = resolvedScoringId;
    result.scoringRules = tournaments.scoringRuleSets[resolvedScoringId];


    if (!result.scoringRules && tournaments.scoreLocationScoringRuleSets) {
      const altScoringId = tournaments.scoreLocationScoringRuleSets[windowKey];
      if (altScoringId && tournaments.scoringRuleSets[altScoringId]) {
        result.scoringRuleSetId = altScoringId;
        result.scoringRules = tournaments.scoringRuleSets[altScoringId];
      }
    }
  }

  if (leaderboardDef.payoutsConfig?.payoutTableIdFormat && tournaments.payoutTables) {
    const resolvedPayoutId = resolveTemplate(
      leaderboardDef.payoutsConfig.payoutTableIdFormat,
      ctx
    );
    result.payoutTableId = resolvedPayoutId;
    result.payoutTables = tournaments.payoutTables[resolvedPayoutId];

    if (!result.payoutTables && tournaments.scoreLocationPayoutTables) {
      const altPayoutId = tournaments.scoreLocationPayoutTables[windowKey];
      if (altPayoutId && tournaments.payoutTables[altPayoutId]) {
        result.payoutTableId = altPayoutId;
        result.payoutTables = tournaments.payoutTables[altPayoutId];
      }
    }
  } else if (tournaments.scoreLocationPayoutTables && tournaments.payoutTables) {
    const payoutId = tournaments.scoreLocationPayoutTables[windowKey];
    if (payoutId) {
      result.payoutTableId = payoutId;
      result.payoutTables = tournaments.payoutTables[payoutId];
    }
  }

  return result;
}