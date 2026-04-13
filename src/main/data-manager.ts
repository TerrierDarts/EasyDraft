import * as fs from 'fs/promises';
import * as path from 'path';
import { DraftState } from '../shared/types';
import { app } from 'electron';

export class DataManager {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'drafts');
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize data directory:', error);
    }
  }

  async saveDraft(draft: DraftState): Promise<void> {
    const filePath = path.join(this.dataDir, `${draft.id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(draft, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save draft: ${error}`);
    }
  }

  async loadDraft(draftId: string): Promise<DraftState> {
    const filePath = path.join(this.dataDir, `${draftId}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as DraftState;
    } catch (error) {
      throw new Error(`Failed to load draft: ${error}`);
    }
  }

  async listDrafts(): Promise<Array<{ id: string; name: string; updatedAt: string }>> {
    try {
      const files = await fs.readdir(this.dataDir);
      const drafts = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.dataDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const draft = JSON.parse(content) as DraftState;
          const firstTeam = draft.teams[0]?.name || 'Untitled';
          drafts.push({
            id: draft.id,
            name: firstTeam,
            updatedAt: draft.updatedAt,
          });
        }
      }

      return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (error) {
      throw new Error(`Failed to list drafts: ${error}`);
    }
  }

  async exportDraft(draftId: string, format: 'json' | 'csv'): Promise<string> {
    try {
      const draft = await this.loadDraft(draftId);

      if (format === 'json') {
        return JSON.stringify(draft, null, 2);
      }

      if (format === 'csv') {
        return this.draftToCSV(draft);
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      throw new Error(`Failed to export draft: ${error}`);
    }
  }

  async importDraft(filePath: string): Promise<DraftState> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const draft = JSON.parse(content) as DraftState;

      // Generate new ID for imported draft
      draft.id = Date.now().toString();
      draft.createdAt = new Date().toISOString();
      draft.updatedAt = new Date().toISOString();

      await this.saveDraft(draft);
      return draft;
    } catch (error) {
      throw new Error(`Failed to import draft: ${error}`);
    }
  }

  private draftToCSV(draft: DraftState): string {
    const lines: string[] = [];

    // Header
    lines.push('Pick#,Team,Player,Tags,Notes');

    // Picks
    draft.picks.forEach((pick, index) => {
      const team = draft.teams.find((t) => t.id === pick.teamId);
      const player = draft.players.find((p) => p.id === pick.playerId);

      if (team && player) {
        const tags = player.tags.join(';');
        const notes = player.notes || '';
        lines.push(
          `${index + 1},"${team.name}","${player.name}","${tags}","${notes}"`
        );
      }
    });

    return lines.join('\n');
  }
}
