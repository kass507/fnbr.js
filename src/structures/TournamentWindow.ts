import type {
  TournamentWindowBlackoutPeriod,
  TournamentWindowData,
  TournamentWindowMetadata,
  TournamentWindowTemplateData,
  TournamentWindowTemplatePayoutTable,
  TournamentWindowTemplateScoringRule,
  TournamentTiebreakFormula,
  ResolvedScoreLocation
} from '../../resources/httpResponses';
import type Tournament from './Tournament';

/**
 * Represents a Fortnite tournament window
 */
class TournamentWindow {
  /**
   * The tournament this window belongs to
   */
  public tournament!: Tournament;

  /**
   * The tournament window ID
   */
  public id: string;

  /**
   * The count down begin date
   */
  public countdownBeginTime: Date;

  /**
   * The tournament window's begin time
   */
  public beginTime: Date;

  /**
   * The tournament window's end time
   */
  public endTime: Date;

  /**
   * The blackout periods
   */
  public blackoutPeriods: TournamentWindowBlackoutPeriod[];

  /**
   * The round number
   */
  public round: number;

  /**
   * The payout delay
   */
  public payoutDelay: number;

  /**
   * Whether this tournament window is TBD
   */
  public isTBD: boolean;

  /**
   * Whether live spectating is enabled for this tournament window
   */
  public canLiveSpectate: boolean;

  /**
   * Rich score locations with resolved payout tables, scoring rules and leaderboard IDs
   */
  public scoreLocations: ResolvedScoreLocation[];

  /**
   * The tournament window's visibility
   */
  public visibility: string;

  /**
   * All required tokens to participate in this tournament window
   */
  public requireAllTokens: string[];

  /**
   * Any tokens required to participate in this tournament window
   */
  public requireAnyTokens: string[];

  /**
   * requireNoneTokensCaller
   */
  public requireNoneTokensCaller: string[];

  /**
   * requireAllTokensCaller
   */
  public requireAllTokensCaller: any[];

  /**
   * requireAnyTokensCaller
   */
  public requireAnyTokensCaller: any[];

  /**
   * Additional requirements to participate in this tournament window
   */
  public additionalRequirements: (string | string[])[];

  /**
   * The team mate eligibility
   */
  public teammateEligibility: string;

  /**
   * The tournament window's meta data
   */
  public metadata: TournamentWindowMetadata;

  /**
   * The tournament window's playlist id (from template)
   */
  public playlistId?: string;

  /**
   * The tournament window's match cap (from template)
   */
  public matchCap?: number;

  /**
   * The tournament window's live session attributes (from template)
   */
  public liveSessionAttributes?: string[];

  /**
   * The tournament window's scoring rules (from template — global for the window)
   */
  public scoringRules?: TournamentWindowTemplateScoringRule[];

  /**
   * The tournament window's tiebreaker formula (from template)
   */
  public tiebreakerFormula?: TournamentTiebreakFormula;

  /**
   * The tournament window's payout table (from template — global for the window)
   */
  public payoutTable?: TournamentWindowTemplatePayoutTable[];

  /**
   * @param tournament The tournament this window belongs to
   * @param windowData The tournament window's data
   * @param tournamentWindowTemplateData The tournament window's template data
   * @param resolvedScoreLocations Score locations with resolved payout/scoring/leaderboard data
   */
  constructor(
    tournament: Tournament,
    windowData: TournamentWindowData,
    tournamentWindowTemplateData?: TournamentWindowTemplateData,
    resolvedScoreLocations?: ResolvedScoreLocation[]
  ) {
    Object.defineProperty(this, 'tournament', { value: tournament });

    // ── Window data ──
    this.id = windowData.eventWindowId;
    this.countdownBeginTime = new Date(windowData.countdownBeginTime);
    this.beginTime = new Date(windowData.beginTime);
    this.endTime = new Date(windowData.endTime);
    this.blackoutPeriods = windowData.blackoutPeriods;
    this.round = windowData.round;
    this.payoutDelay = windowData.payoutDelay;
    this.isTBD = windowData.isTBD;
    this.canLiveSpectate = windowData.canLiveSpectate;
    this.visibility = windowData.visibility;
    this.requireAllTokens = windowData.requireAllTokens;
    this.requireAnyTokens = windowData.requireAnyTokens;
    this.requireNoneTokensCaller = windowData.requireNoneTokensCaller;
    this.requireAllTokensCaller = windowData.requireAllTokensCaller;
    this.requireAnyTokensCaller = windowData.requireAnyTokensCaller;
    this.additionalRequirements = windowData.additionalRequirements;
    this.teammateEligibility = windowData.teammateEligibility;
    this.metadata = windowData.metadata;

    // ── Score locations enhanced ──
    this.scoreLocations = (resolvedScoreLocations ?? []).map((resolved) => ({
      leaderboardDefId: resolved.leaderboardDefId,
      isMainWindowLeaderboard: resolved.isMainWindowLeaderboard,
      leaderboardEventId: resolved.leaderboardEventId,
      leaderboardEventWindowId: resolved.leaderboardEventWindowId,
      payoutTableId: resolved.payoutTableId,
      payoutTables: resolved.payoutTables ?? [],
      scoringRuleSetId: resolved.scoringRuleSetId,
      scoringRules: resolved.scoringRules ?? [],
    }));

    if (this.scoreLocations.length === 0 && windowData.scoreLocations.length > 0) {
      this.scoreLocations = windowData.scoreLocations.map((sl) => ({
        leaderboardDefId: sl.leaderboardDefId ?? '',
        isMainWindowLeaderboard: sl.isMainWindowLeaderboard ?? false,
        payoutTables: [],
        scoringRules: [],
      }));
    }

    // ── Template data  ──
    this.playlistId = tournamentWindowTemplateData?.playlistId;
    this.matchCap = tournamentWindowTemplateData?.matchCap;
    this.liveSessionAttributes = tournamentWindowTemplateData?.liveSessionAttributes;
    this.scoringRules = tournamentWindowTemplateData?.scoringRules;
    this.tiebreakerFormula = tournamentWindowTemplateData?.tiebreakerFormula;
    this.payoutTable = tournamentWindowTemplateData?.payoutTable;
  }

  /**
   * Gets the scoreLocation enriched by leaderboardDefId
   * @param leaderboardDefId Leaderboard definition ID
   */
  public getLeaderboardDef(leaderboardDefId: string): ResolvedScoreLocation | undefined {
    return this.scoreLocations.find((sl) => sl.leaderboardDefId === leaderboardDefId);
  }

  /**
   * Gets the scoring rules by scoringRuleSetId
   * @param scoringRuleSetId scoringRule id
   */
  public getScoringRules(scoringRuleSetId: string): TournamentWindowTemplateScoringRule[] {
    const sl = this.scoreLocations.find((s) => s.scoringRuleSetId === scoringRuleSetId);
    return sl?.scoringRules ?? [];
  }

  /**
   * Get the payout table by payoutTableId
   * @param payoutTableId payout table id 
   */
  public getPayoutTable(payoutTableId: string): TournamentWindowTemplatePayoutTable[] {
    const sl = this.scoreLocations.find((s) => s.payoutTableId === payoutTableId);
    return sl?.payoutTables ?? [];
  }

  /**
   * Fetches the results for this tournament window
   * @param page The results page index
   * @param showLiveSessions Whether to show live sessions
   */
  public async getResults(page = 0, showLiveSessions = false) {
    return this.tournament.client.tournaments.getWindowResults(
      this.tournament.id,
      this.id,
      showLiveSessions,
      page
    );
  }
}

export default TournamentWindow;