import { DraftState, Team } from './types';

export class DraftEngine {
  private state: DraftState;

  constructor(draftState: DraftState) {
    this.state = draftState;
  }

  /**
   * Generate the complete draft order based on the mode
   */
  generateDraftOrder(): string[] {
    const teamIds = this.state.teams.map((t) => t.id);
    const round1 = this.shuffleIfRandom(teamIds);

    if (this.state.draftOrder === 'snake') {
      const numTeams = teamIds.length;
      const totalPicks = this.state.players.length;
      const rounds = Math.ceil(totalPicks / numTeams);

      const order: string[] = [];
      for (let round = 0; round < rounds; round++) {
        const roundOrder =
          round % 2 === 0 ? round1 : [...round1].reverse();
        order.push(...roundOrder);
      }
      return order.slice(0, totalPicks);
    }

    // Sequential and random modes repeat the same order
    const totalPicks = this.state.players.length;
    const rounds = Math.ceil(totalPicks / round1.length);
    const order: string[] = [];
    for (let i = 0; i < rounds; i++) {
      order.push(...round1);
    }
    return order.slice(0, totalPicks);
  }

  /**
   * Get the team whose turn it is
   */
  getCurrentTeam(): Team | null {
    const order = this.generateDraftOrder();
    const teamId = order[this.state.currentPickIndex];
    return this.state.teams.find((t) => t.id === teamId) || null;
  }

  /**
   * Check if a pick is valid against constraints
   */
  isPickValid(teamId: string, playerId: string): boolean {
    const team = this.state.teams.find((t) => t.id === teamId);
    const player = this.state.players.find((p) => p.id === playerId);

    if (!team || !player) return false;

    // Check if player is already drafted
    if (this.state.picks.some((p) => p.playerId === playerId)) {
      return false;
    }

    // Check global tag constraints
    for (const [tag, required] of Object.entries(
      this.state.constraints || {}
    )) {
      const currentCount = team.roster
        .map((pid) => this.state.players.find((p) => p.id === pid))
        .filter((p) => p && p.tags.includes(tag)).length;

      if (currentCount < required) {
        // This player must have the required tag
        if (!player.tags.includes(tag)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get available players for the current team
   */
  getAvailablePlayers(): string[] {
    const currentTeam = this.getCurrentTeam();
    if (!currentTeam) return [];

    const draftedPlayerIds = this.state.picks.map((p) => p.playerId);
    const available = this.state.players
      .filter((p) => !draftedPlayerIds.includes(p.id))
      .map((p) => p.id);

    return available;
  }

  /**
   * Get constrained players (must draft these if applicable)
   */
  getConstrainedPlayers(teamId: string): string[] {
    const constrained: string[] = [];

    for (const [tag, required] of Object.entries(
      this.state.constraints || {}
    )) {
      const team = this.state.teams.find((t) => t.id === teamId);
      if (!team) continue;

      const currentCount = team.roster
        .map((pid) => this.state.players.find((p) => p.id === pid))
        .filter((p) => p && p.tags.includes(tag)).length;

      if (currentCount < required) {
        // Add available players with this tag
        const draftedPlayerIds = this.state.picks.map((p) => p.playerId);
        const availableWithTag = this.state.players
          .filter(
            (p) =>
              p.tags.includes(tag) &&
              !draftedPlayerIds.includes(p.id)
          )
          .map((p) => p.id);

        constrained.push(...availableWithTag);
      }
    }

    return [...new Set(constrained)];
  }

  /**
   * Get warning message if pick is suboptimal
   */
  getPickWarning(teamId: string, playerId: string): string | null {
    const team = this.state.teams.find((t) => t.id === teamId);
    const player = this.state.players.find((p) => p.id === playerId);

    if (!team || !player) return null;

    // Check if there are constrained players available
    const constrained = this.getConstrainedPlayers(teamId);
    if (constrained.length > 0 && !constrained.includes(playerId)) {
      const constrainedCount = constrained.length;
      return `Warning: Team must draft ${constrainedCount} constrained player(s). Consider picking from: ${constrained.map((pid) => this.state.players.find((p) => p.id === pid)?.name).join(', ')}`;
    }

    return null;
  }

  /**
   * Get the remaining picks count
   */
  getRemainingPicksCount(): number {
    return this.state.players.length - this.state.picks.length;
  }

  /**
   * Private helper
   */
  private shuffleIfRandom(array: string[]): string[] {
    if (this.state.draftOrder === 'random') {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
    return array;
  }
}

export function createDraftEngine(draftState: DraftState): DraftEngine {
  return new DraftEngine(draftState);
}
