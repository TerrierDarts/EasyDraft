import fs from 'fs/promises';
import path from 'path';
import { User, Draft } from '../shared/auth-types';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const DRAFTS_FILE = path.join(DATA_DIR, 'drafts.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

// Ensure files exist
async function ensureFiles() {
  await ensureDataDir();
  
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([]));
  }
  
  try {
    await fs.access(DRAFTS_FILE);
  } catch {
    await fs.writeFile(DRAFTS_FILE, JSON.stringify([]));
  }
}

// User operations
export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  await ensureFiles();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(data);
  return users.find(u => u.googleId === googleId) || null;
}

export async function getUserById(userId: string): Promise<User | null> {
  await ensureFiles();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(data);
  return users.find(u => u.id === userId) || null;
}

export async function createUser(user: User): Promise<User> {
  await ensureFiles();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(data);
  users.push(user);
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return user;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  await ensureFiles();
  const data = await fs.readFile(USERS_FILE, 'utf-8');
  const users: User[] = JSON.parse(data);
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  return users[index];
}

// Draft operations
export async function getDraftsByUserId(userId: string): Promise<Draft[]> {
  await ensureFiles();
  const data = await fs.readFile(DRAFTS_FILE, 'utf-8');
  const drafts: Draft[] = JSON.parse(data);
  return drafts.filter(d => d.userId === userId);
}

export async function getDraftById(draftId: string, userId: string): Promise<Draft | null> {
  await ensureFiles();
  const data = await fs.readFile(DRAFTS_FILE, 'utf-8');
  const drafts: Draft[] = JSON.parse(data);
  return drafts.find(d => d.id === draftId && d.userId === userId) || null;
}

export async function createDraft(draft: Draft): Promise<Draft> {
  await ensureFiles();
  const data = await fs.readFile(DRAFTS_FILE, 'utf-8');
  const drafts: Draft[] = JSON.parse(data);
  drafts.push(draft);
  await fs.writeFile(DRAFTS_FILE, JSON.stringify(drafts, null, 2));
  return draft;
}

export async function updateDraft(draftId: string, userId: string, updates: Partial<Draft>): Promise<Draft | null> {
  await ensureFiles();
  const data = await fs.readFile(DRAFTS_FILE, 'utf-8');
  const drafts: Draft[] = JSON.parse(data);
  const index = drafts.findIndex(d => d.id === draftId && d.userId === userId);
  
  if (index === -1) return null;
  
  drafts[index] = { ...drafts[index], ...updates, updatedAt: new Date().toISOString() };
  await fs.writeFile(DRAFTS_FILE, JSON.stringify(drafts, null, 2));
  return drafts[index];
}

export async function deleteDraft(draftId: string, userId: string): Promise<boolean> {
  await ensureFiles();
  const data = await fs.readFile(DRAFTS_FILE, 'utf-8');
  let drafts: Draft[] = JSON.parse(data);
  const length = drafts.length;
  
  drafts = drafts.filter(d => !(d.id === draftId && d.userId === userId));
  
  if (drafts.length === length) return false;
  
  await fs.writeFile(DRAFTS_FILE, JSON.stringify(drafts, null, 2));
  return true;
}

export async function countUserDrafts(userId: string): Promise<number> {
  const drafts = await getDraftsByUserId(userId);
  return drafts.length;
}
