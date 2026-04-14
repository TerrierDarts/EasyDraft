import express from 'express';
import http from 'http';
import path from 'path';
import * as db from './db';
import * as auth from './auth';

// CommonJS __dirname compatibility  
const currentDir = path.dirname(module.filename || process.cwd());

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Auth middleware
async function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = auth.verifyAuthToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = await db.getUserById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

// === Authentication Routes ===

// Google login
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing credential' });
  }

  const result = await auth.authenticateGoogleUser(credential);

  if (!result) {
    return res.status(401).json({ error: 'Authentication failed' });
  }

  res.json({
    user: result.user,
    token: result.token,
  });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req: any, res) => {
  res.json({ user: req.user });
});

// === Draft Routes ===

// Get all drafts for current user
app.get('/api/drafts', authMiddleware, async (req: any, res) => {
  try {
    const drafts = await db.getDraftsByUserId(req.user.id);
    res.json(drafts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load drafts' });
  }
});

// Create new draft
app.post('/api/drafts', authMiddleware, async (req: any, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Draft name is required' });
  }

  try {
    // Check draft limit for free users
    if (req.user.subscriptionTier === 'free') {
      const count = await db.countUserDrafts(req.user.id);
      if (count >= req.user.maxDrafts) {
        return res.status(403).json({ 
          error: `Free users can only have ${req.user.maxDrafts} draft` 
        });
      }
    }

    const draft = await db.createDraft({
      id: auth.generateSimpleId(),
      userId: req.user.id,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {}, // Empty draft structure
    });

    res.status(201).json(draft);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// Get single draft
app.get('/api/drafts/:draftId', authMiddleware, async (req: any, res) => {
  try {
    const draft = await db.getDraftById(req.params.draftId, req.user.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load draft' });
  }
});

// Update draft
app.put('/api/drafts/:draftId', authMiddleware, async (req: any, res) => {
  try {
    const draft = await db.updateDraft(req.params.draftId, req.user.id, {
      name: req.body.name,
      data: req.body.data,
    });

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    res.json(draft);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// Delete draft
app.delete('/api/drafts/:draftId', authMiddleware, async (req: any, res) => {
  try {
    const success = await db.deleteDraft(req.params.draftId, req.user.id);
    if (!success) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

// === Health Check ===

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Serve React App ===

const rendererPath = path.join(currentDir, '../../dist/renderer');

// Serve static files
app.use(express.static(rendererPath));

// Serve React app for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(rendererPath, 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🎯 EasyDraft Server running on http://localhost:${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser to get started\n`);
});

export { app, server };
