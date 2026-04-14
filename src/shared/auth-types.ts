// Authentication and user types

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: string;
  subscriptionTier: 'free' | 'pro' | 'premium';
  maxDrafts: number; // 1 for free, unlimited for paid
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface GoogleAuthPayload {
  id_token: string;
  credential?: string;
}

export interface Draft {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: any; // DraftState
}
