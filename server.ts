import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  db,
  dataDirectory,
  databasePath,
  getSessionSecret,
  getSettings,
  hashPassword,
  initDatabase,
  uploadsDirectory,
  verifyPassword,
} from './server/db.ts';
import type { AdminUser } from './src/types/church.ts';

dotenv.config();
initDatabase();

const SESSION_COOKIE = 'evp_pastor_session';
const SESSION_SECRET = getSessionSecret();
const PORT = Number(process.env.PORT) || 3000;
const LOCAL_MODE = process.env.CENTRAL_LOCAL_MODE === '1';
const HOST = LOCAL_MODE ? '127.0.0.1' : (process.env.HOST || '127.0.0.1');

interface AuthenticatedRequest extends Request {
  pastor?: AdminUser;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    cookies[key] = val;
  }
  return cookies;
}

function signToken(rawToken: string): string {
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(rawToken).digest('hex');
  return `${rawToken}.${sig}`;
}

function verifySignedToken(signedValue: string | undefined): string | null {
  if (!signedValue) return null;
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  const [rawToken, sig] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(rawToken).digest('hex');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return rawToken;
}

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function getAuthenticatedPastor(req: Request): AdminUser | null {
  const cookies = parseCookies(req.headers.cookie);
  const rawToken = verifySignedToken(cookies[SESSION_COOKIE]);
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, s.expires_at
       FROM sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash) as (AdminUser & { expires_at: string }) | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return null;
  }
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

function createSessionCookie(res: Response, userId: number): void {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
    tokenHash,
    userId,
    expiresAt
  );

  const signed = signToken(rawToken);
  res.cookie(SESSION_COOKIE, signed, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !LOCAL_MODE && process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function getPublicAlbums() {
  const albums = db.prepare("SELECT * FROM gallery_albums WHERE status = 'published' ORDER BY id DESC").all() as Array<Record<string,unknown>>;
  const photos = db.prepare('SELECT * FROM gallery_photos WHERE album_id IS NOT NULL ORDER BY id ASC').all() as Array<Record<string,unknown>>;
  return albums.map(album => {
    const albumPhotos = photos.filter(photo => photo.album_id === album.id);
    return { ...album, photos: albumPhotos, photo_count: albumPhotos.length, cover_url: album.cover_url || albumPhotos[0]?.image_url || '' };
  });
}

function requirePastor(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const pastor = getAuthenticatedPastor(req);
  if (!pastor) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login na Área do Pastor.' });
    return;
  }
  req.pastor = pastor;
  next();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Simple in-memory rate limiter for public prayer submission anti-spam
const prayerRateMap = new Map<string, number[]>();

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  // The local administration API must never be exposed to the public internet.
  if (LOCAL_MODE) {
    app.use((req, res, next) => {
      const host = (req.headers.host || '').split(':')[0].toLowerCase();
      if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
        res.status(403).json({ error: 'Acesso local obrigatório.' });
        return;
      }
      next();
    });
  }
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const origin = req.get('origin');
      if (origin) {
        try {
          const parsed = new URL(origin);
          const expectedHost = (req.get('host') || '').toLowerCase();
          if (parsed.host.toLowerCase() !== expectedHost) {
            res.status(403).json({ error: 'Origem não autorizada.' });
            return;
          }
        } catch {
          res.status(403).json({ error: 'Origem inválida.' });
          return;
        }
      }
    }
    next();
  });
  app.use(express.json({ limit: '8mb' }));
  app.use('/uploads', express.static(uploadsDirectory, { dotfiles: 'deny', index: false }));

  // =========================================================================
  // PUBLIC API ROUTES
  // =========================================================================
  app.get('/api/public/site', (_req, res) => {
    try {
      const settings = getSettings();
      const wordOfTheDay =
        db
          .prepare(
            `SELECT * FROM publications
             WHERE category = 'palavra_do_dia' AND status = 'published'
             ORDER BY id DESC LIMIT 1`
          )
          .get() || null;

      const publications = db
        .prepare(
          `SELECT * FROM publications
           WHERE status = 'published'
           ORDER BY published_date DESC, id DESC`
        )
        .all();

      const events = db
        .prepare(
          `SELECT * FROM events
           WHERE status = 'published' AND (event_date = '' OR event_date >= ?)
           ORDER BY is_highlighted DESC, CASE WHEN event_date = '' THEN 1 ELSE 0 END, event_date ASC, id DESC`
        )
        .all(new Date().toISOString().slice(0,10));

      const todayIso = new Date().toISOString().slice(0, 10);
      const notices = db
        .prepare(
          `SELECT * FROM notices
           WHERE status = 'published' AND (expires_at = '' OR expires_at >= ?)
           ORDER BY is_highlighted DESC, id DESC`
        )
        .all(todayIso);

      const gallery = db.prepare("SELECT p.* FROM gallery_photos p LEFT JOIN gallery_albums a ON a.id=p.album_id WHERE p.album_id IS NULL OR a.status='published' ORDER BY p.id DESC").all();
      const albums = getPublicAlbums();

      res.json({
        settings,
        wordOfTheDay,
        publications,
        events,
        notices,
        gallery,
        albums,
      });
    } catch (err) {
      console.error('Error loading public site data:', err);
      res.status(500).json({ error: 'Erro ao carregar dados do site.' });
    }
  });

  app.post('/api/prayers', (req, res) => {
    try {
      const { name, whatsapp, request_text, is_anonymous, privacy_consent, website_hp } = req.body || {};

      // Honeypot anti-spam trap
      if (website_hp && String(website_hp).trim().length > 0) {
        res.status(400).json({ error: 'Envio bloqueado pela proteção anti-spam.' });
        return;
      }

      // Rate limit per IP (max 5 requests per 15 minutes)
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'local';
      const now = Date.now();
      const recent = (prayerRateMap.get(clientIp) || []).filter((ts) => now - ts < 15 * 60 * 1000);
      if (recent.length >= 5) {
        res.status(429).json({
          error: 'Muitos envios seguidos detectados. Aguarde alguns minutos antes de enviar outro pedido.',
        });
        return;
      }

      const cleanText = String(request_text || '').trim();
      if (cleanText.length < 10) {
        res.status(400).json({ error: 'Escreva seu pedido de oração com pelo menos 10 caracteres.' });
        return;
      }
      if (cleanText.length > 2000) {
        res.status(400).json({ error: 'O pedido de oração deve ter no máximo 2000 caracteres.' });
        return;
      }
      if (!privacy_consent) {
        res.status(400).json({ error: 'É necessário aceitar a política de privacidade para enviar o pedido.' });
        return;
      }

      const anonymousFlag = is_anonymous ? 1 : 0;
      const cleanName = anonymousFlag ? 'Anônimo' : String(name || '').trim().slice(0, 120);
      const cleanWhatsapp = anonymousFlag ? '' : String(whatsapp || '').trim().slice(0, 40);

      const info = db
        .prepare(
          `INSERT INTO prayer_requests (name, whatsapp, request_text, is_anonymous, privacy_consent, status)
           VALUES (?, ?, ?, ?, 1, 'pending')`
        )
        .run(cleanName, cleanWhatsapp, cleanText, anonymousFlag);

      recent.push(now);
      prayerRateMap.set(clientIp, recent);

      res.status(201).json({
        ok: true,
        id: Number(info.lastInsertRowid),
        message: 'Seu pedido de oração foi recebido com sigilo e será apresentado diante de Deus pela nossa equipe pastoral.',
      });
    } catch (err) {
      console.error('Error saving prayer request:', err);
      res.status(500).json({ error: 'Não foi possível registrar seu pedido de oração.' });
    }
  });

  // =========================================================================
  // AUTHENTICATION ROUTES
  // =========================================================================
  app.get('/api/auth/status', (req, res) => {
    const countRow = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
    const user = getAuthenticatedPastor(req);
    res.json({
      initialized: countRow.count > 0,
      user,
    });
  });

  app.post('/api/auth/setup', (req, res) => {
    // Initial setup is only permitted from the loopback interface.
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || '')) {
      res.status(403).json({ error: 'Configure o primeiro acesso no computador local.' });
      return;
    }
    try {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
      if (countRow.count > 0) {
        res.status(403).json({ error: 'A conta pastoral já foi configurada. Faça login com seu e-mail e senha.' });
        return;
      }

      const { name, email, password } = req.body || {};
      const cleanName = String(name || '').trim();
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');

      if (cleanName.length < 3) {
        res.status(400).json({ error: 'Informe o nome completo do pastor ou responsável.' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        res.status(400).json({ error: 'Informe um e-mail válido.' });
        return;
      }
      if (cleanPassword.length < 8) {
        res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
        return;
      }

      const passwordHash = hashPassword(cleanPassword);
      const info = db
        .prepare('INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
        .run(cleanName, cleanEmail, passwordHash, 'pastor');

      const userId = Number(info.lastInsertRowid);
      createSessionCookie(res, userId);

      res.status(201).json({
        user: { id: userId, name: cleanName, email: cleanEmail, role: 'pastor' },
      });
    } catch (err) {
      console.error('Error in initial pastor setup:', err);
      res.status(500).json({ error: 'Erro ao cadastrar conta pastoral.' });
    }
  });

  const loginAttempts = new Map<string, { count: number; until: number }>();
  app.post('/api/auth/login', (req, res) => {
    const ip = req.socket.remoteAddress || 'unknown';
    const attempt = loginAttempts.get(ip);
    if (attempt && attempt.count >= 8 && attempt.until > Date.now()) {
      res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
      return;
    }
    try {
      const { email, password } = req.body || {};
      const cleanEmail = String(email || '').trim().toLowerCase();
      const cleanPassword = String(password || '');

      if (!cleanEmail || !cleanPassword) {
        res.status(400).json({ error: 'Preencha e-mail e senha.' });
        return;
      }

      const user = db
        .prepare('SELECT id, name, email, password_hash, role FROM admin_users WHERE email = ?')
        .get(cleanEmail) as (AdminUser & { password_hash: string }) | undefined;

      if (!user || !verifyPassword(cleanPassword, user.password_hash)) {
        const prev = loginAttempts.get(ip);
        loginAttempts.set(ip, { count: (prev?.until && prev.until > Date.now() ? prev.count : 0) + 1, until: Date.now() + 15 * 60 * 1000 });
        res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        return;
      }

      loginAttempts.delete(ip);
      createSessionCookie(res, user.id);
      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error('Error in pastor login:', err);
      res.status(500).json({ error: 'Erro ao autenticar.' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = verifySignedToken(cookies[SESSION_COOKIE]);
    if (rawToken) {
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(rawToken));
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  // =========================================================================
  // PROTECTED ADMIN ROUTES (/api/admin/*)
  // =========================================================================
  app.get('/api/admin/overview', requirePastor, (_req, res) => {
    const pubTotal = (db.prepare('SELECT COUNT(*) as c FROM publications').get() as { c: number }).c;
    const pubPublished = (
      db.prepare("SELECT COUNT(*) as c FROM publications WHERE status = 'published'").get() as { c: number }
    ).c;
    const eventTotal = (db.prepare('SELECT COUNT(*) as c FROM events').get() as { c: number }).c;
    const prayerTotal = (db.prepare('SELECT COUNT(*) as c FROM prayer_requests').get() as { c: number }).c;
    const prayerPending = (
      db.prepare("SELECT COUNT(*) as c FROM prayer_requests WHERE status = 'pending'").get() as { c: number }
    ).c;
    const noticeTotal = (db.prepare('SELECT COUNT(*) as c FROM notices').get() as { c: number }).c;
    const galleryTotal = (db.prepare('SELECT COUNT(*) as c FROM gallery_photos').get() as { c: number }).c;

    res.json({
      publications: { total: pubTotal, published: pubPublished },
      events: { total: eventTotal },
      prayers: { total: prayerTotal, pending: prayerPending },
      notices: { total: noticeTotal },
      gallery: { total: galleryTotal },
    });
  });

  // Publications CRUD
  app.get('/api/admin/publications', requirePastor, (_req, res) => {
    const rows = db.prepare('SELECT * FROM publications ORDER BY published_date DESC, id DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/publications', requirePastor, (req, res) => {
    try {
      const { title, category, content, bible_reference, image_url, published_date, status } = req.body || {};
      if (!title || !content || !category) {
        res.status(400).json({ error: 'Título, categoria e conteúdo são obrigatórios.' });
        return;
      }
      const baseSlug = slugify(String(title)) || 'publicacao';
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const pubDate = String(published_date || new Date().toISOString().slice(0, 10));
      const pubStatus = status === 'published' ? 'published' : 'draft';

      const info = db
        .prepare(
          `INSERT INTO publications (title, slug, category, content, bible_reference, image_url, published_date, status, is_demo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
        )
        .run(
          String(title).trim(),
          slug,
          category,
          String(content).trim(),
          String(bible_reference || '').trim(),
          String(image_url || '').trim(),
          pubDate,
          pubStatus
        );

      const created = db.prepare('SELECT * FROM publications WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating publication:', err);
      res.status(500).json({ error: 'Erro ao salvar publicação.' });
    }
  });

  app.put('/api/admin/publications/:id', requirePastor, (req, res) => {
    try {
      const id = Number(req.params.id);
      const { title, category, content, bible_reference, image_url, published_date, status } = req.body || {};
      if (!title || !content || !category) {
        res.status(400).json({ error: 'Título, categoria e conteúdo são obrigatórios.' });
        return;
      }
      const pubStatus = status === 'published' ? 'published' : 'draft';
      db.prepare(
        `UPDATE publications
         SET title = ?, category = ?, content = ?, bible_reference = ?, image_url = ?, published_date = ?, status = ?, is_demo = 0, is_highlighted = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        String(title).trim(),
        category,
        String(content).trim(),
        String(bible_reference || '').trim(),
        String(image_url || '').trim(),
        String(published_date || new Date().toISOString().slice(0, 10)),
        pubStatus,
        id
      );
      const updated = db.prepare('SELECT * FROM publications WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      console.error('Error updating publication:', err);
      res.status(500).json({ error: 'Erro ao atualizar publicação.' });
    }
  });

  app.delete('/api/admin/publications/:id', requirePastor, (req, res) => {
    db.prepare('DELETE FROM publications WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Events CRUD
  app.get('/api/admin/events', requirePastor, (_req, res) => {
    const rows = db.prepare('SELECT * FROM events ORDER BY id DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/events', requirePastor, (req, res) => {
    try {
      const { name, event_date, event_time, description, image_url, location, status, is_highlighted } = req.body || {};
      if (!name || !event_time) {
        res.status(400).json({ error: 'Nome e horário do evento são obrigatórios.' });
        return;
      }
      const evStatus = status === 'published' ? 'published' : 'draft';
      const info = db
        .prepare(
          `INSERT INTO events (name, event_date, event_time, description, image_url, location, status, is_demo, is_highlighted)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
        )
        .run(
          String(name).trim(),
          String(event_date || '').trim(),
          String(event_time).trim(),
          String(description || '').trim(),
          String(image_url || '').trim(),
          String(location || 'Templo Sede').trim(),
          evStatus, is_highlighted ? 1 : 0
        );
      const created = db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ error: 'Erro ao criar evento.' });
    }
  });

  app.put('/api/admin/events/:id', requirePastor, (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, event_date, event_time, description, image_url, location, status, is_highlighted } = req.body || {};
      if (!name || !event_time) {
        res.status(400).json({ error: 'Nome e horário do evento são obrigatórios.' });
        return;
      }
      const evStatus = status === 'published' ? 'published' : 'draft';
      db.prepare(
        `UPDATE events
         SET name = ?, event_date = ?, event_time = ?, description = ?, image_url = ?, location = ?, status = ?, is_demo = 0, is_highlighted = ?, updated_at = datetime('now')
         WHERE id = ?`
      ).run(
        String(name).trim(),
        String(event_date || '').trim(),
        String(event_time).trim(),
        String(description || '').trim(),
        String(image_url || '').trim(),
        String(location || 'Templo Sede').trim(),
        evStatus, is_highlighted ? 1 : 0,
        id
      );
      const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
      res.json(updated);
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ error: 'Erro ao atualizar evento.' });
    }
  });

  app.delete('/api/admin/events/:id', requirePastor, (req, res) => {
    db.prepare('DELETE FROM events WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Notices CRUD
  app.get('/api/admin/notices', requirePastor, (_req, res) => {
    const rows = db.prepare('SELECT * FROM notices ORDER BY id DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/notices', requirePastor, (req, res) => {
    const { title, content, is_highlighted, expires_at, status } = req.body || {};
    if (!title || !content) {
      res.status(400).json({ error: 'Título e texto do aviso são obrigatórios.' });
      return;
    }
    const info = db
      .prepare(
        `INSERT INTO notices (title, content, is_highlighted, expires_at, status)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        String(title).trim(),
        String(content).trim(),
        is_highlighted ? 1 : 0,
        String(expires_at || '').trim(),
        status === 'draft' ? 'draft' : 'published'
      );
    const created = db.prepare('SELECT * FROM notices WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  });

  app.put('/api/admin/notices/:id', requirePastor, (req, res) => {
    const id = Number(req.params.id);
    const { title, content, is_highlighted, expires_at, status } = req.body || {};
    if (!title || !content) {
      res.status(400).json({ error: 'Título e texto do aviso são obrigatórios.' });
      return;
    }
    db.prepare(
      `UPDATE notices SET title = ?, content = ?, is_highlighted = ?, expires_at = ?, status = ? WHERE id = ?`
    ).run(
      String(title).trim(),
      String(content).trim(),
      is_highlighted ? 1 : 0,
      String(expires_at || '').trim(),
      status === 'draft' ? 'draft' : 'published',
      id
    );
    const updated = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);
    res.json(updated);
  });

  app.delete('/api/admin/notices/:id', requirePastor, (req, res) => {
    db.prepare('DELETE FROM notices WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Private Prayer Requests Management
  app.get('/api/admin/prayers', requirePastor, (_req, res) => {
    const rows = db.prepare('SELECT * FROM prayer_requests ORDER BY id DESC').all();
    res.json(rows);
  });

  app.patch('/api/admin/prayers/:id', requirePastor, (req, res) => {
    const id = Number(req.params.id);
    const status = req.body?.status === 'prayed' ? 'prayed' : 'pending';
    db.prepare('UPDATE prayer_requests SET status = ? WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM prayer_requests WHERE id = ?').get(id);
    res.json(updated);
  });

  app.delete('/api/admin/prayers/:id', requirePastor, (req, res) => {
    db.prepare('DELETE FROM prayer_requests WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Album management (all mutations require authenticated administrator)
  app.get('/api/admin/albums', requirePastor, (_req, res) => {
    const albums = db.prepare('SELECT * FROM gallery_albums ORDER BY id DESC').all() as Array<Record<string,unknown>>;
    const photos = db.prepare('SELECT * FROM gallery_photos ORDER BY id ASC').all() as Array<Record<string,unknown>>;
    res.json(albums.map(album => ({...album, photos: photos.filter(photo => photo.album_id === album.id)})));
  });
  app.post('/api/admin/albums', requirePastor, (req, res) => {
    const {title,description,event_date,status} = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 160) { res.status(400).json({error:'Informe um título válido.'}); return; }
    const info = db.prepare('INSERT INTO gallery_albums (title,description,event_date,status) VALUES (?,?,?,?)')
      .run(title.trim(), String(description || '').slice(0,2000), String(event_date || ''), status === 'draft' ? 'draft' : 'published');
    res.status(201).json({id:Number(info.lastInsertRowid)});
  });
  app.put('/api/admin/albums/:id', requirePastor, (req, res) => {
    const {title,description,event_date,status,cover_url} = req.body || {};
    if (typeof title !== 'string' || !title.trim()) {res.status(400).json({error:'Título obrigatório.'});return;}
    const info=db.prepare('UPDATE gallery_albums SET title=?, description=?, event_date=?, status=?, cover_url=? WHERE id=?')
      .run(title.trim().slice(0,160),String(description||'').slice(0,2000),String(event_date||''),status==='draft'?'draft':'published',String(cover_url||''),Number(req.params.id));
    res.status(info.changes?200:404).json({ok:!!info.changes});
  });
  app.delete('/api/admin/albums/:id', requirePastor, (req, res) => {
    const id=Number(req.params.id);
    db.prepare('UPDATE gallery_photos SET album_id=NULL WHERE album_id=?').run(id);
    db.prepare('DELETE FROM gallery_albums WHERE id=?').run(id);
    res.json({ok:true});
  });
  app.post('/api/admin/albums/:id/photos', requirePastor, (req,res) => {
    const id=Number(req.params.id);
    if (!db.prepare('SELECT id FROM gallery_albums WHERE id=?').get(id)) {res.status(404).json({error:'Álbum não encontrado.'});return;}
    const photos=req.body?.photos;
    if (!Array.isArray(photos) || !photos.length || photos.length>100) {res.status(400).json({error:'Selecione de 1 a 100 fotos.'});return;}
    if (photos.some((photo:unknown)=>typeof photo!=='object'||photo===null||typeof (photo as any).image_url!=='string'||!/^\/uploads\/[\w.-]+$/.test((photo as any).image_url))) {res.status(400).json({error:'Imagem inválida.'});return;}
    const insert=db.prepare('INSERT INTO gallery_photos (title,caption,image_url,event_date,album_id) VALUES (?,?,?,?,?)');
    db.exec('BEGIN');
    try { for(const photo of photos) insert.run(String(photo.title||'Foto').slice(0,160),String(photo.caption||'').slice(0,500),photo.image_url,'',id); db.exec('COMMIT'); }
    catch(err){db.exec('ROLLBACK');throw err;}
    res.status(201).json({ok:true,count:photos.length});
  });

  // User management: only the primary pastor can create or revoke accounts.
  app.get('/api/admin/users', requirePastor, (req:AuthenticatedRequest,res) => {
    if(!LOCAL_MODE){res.status(403).json({error:'Gerenciamento de usuários disponível apenas na Central local.'});return;}
    if(req.pastor?.role!=='pastor'){res.status(403).json({error:'Apenas o pastor administrador.'});return;}
    res.json(db.prepare('SELECT id,name,email,role,created_at FROM admin_users ORDER BY id').all());
  });
  app.post('/api/admin/users', requirePastor, (req:AuthenticatedRequest,res) => {
    if(!LOCAL_MODE){res.status(403).json({error:'Gerenciamento de usuários disponível apenas na Central local.'});return;}
    if(req.pastor?.role!=='pastor'){res.status(403).json({error:'Apenas o pastor administrador.'});return;}
    const {name,email,password}=req.body||{};
    if(typeof name!=='string'||name.trim().length<3||typeof email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<10){res.status(400).json({error:'Nome, e-mail válido e senha com 10 caracteres são obrigatórios.'});return;}
    try { const info=db.prepare('INSERT INTO admin_users (name,email,password_hash,role) VALUES (?,?,?,?)').run(name.trim(),email.trim().toLowerCase(),hashPassword(password),'editor');res.status(201).json({id:Number(info.lastInsertRowid)}); }
    catch{res.status(409).json({error:'E-mail já cadastrado.'});}
  });
  app.delete('/api/admin/users/:id', requirePastor, (req:AuthenticatedRequest,res) => {
    if(!LOCAL_MODE){res.status(403).json({error:'Gerenciamento de usuários disponível apenas na Central local.'});return;}
    if(req.pastor?.role!=='pastor'){res.status(403).json({error:'Apenas o pastor administrador.'});return;}
    const id=Number(req.params.id);
    if(id===req.pastor.id){res.status(400).json({error:'Você não pode excluir sua própria conta.'});return;}
    const target=db.prepare('SELECT role FROM admin_users WHERE id=?').get(id) as {role:string}|undefined;
    if(!target||target.role==='pastor'){res.status(403).json({error:'A conta principal não pode ser excluída.'});return;}
    db.prepare('DELETE FROM admin_users WHERE id=?').run(id);
    res.json({ok:true});
  });

  // Gallery CRUD
  app.get('/api/admin/gallery', requirePastor, (_req, res) => {
    const rows = db.prepare('SELECT * FROM gallery_photos ORDER BY id DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/gallery', requirePastor, (req, res) => {
    const { title, caption, image_url, event_date } = req.body || {};
    if (!title || !image_url) {
      res.status(400).json({ error: 'Título e imagem são obrigatórios.' });
      return;
    }
    const info = db
      .prepare('INSERT INTO gallery_photos (title, caption, image_url, event_date) VALUES (?, ?, ?, ?)')
      .run(
        String(title).trim(),
        String(caption || '').trim(),
        String(image_url).trim(),
        String(event_date || '').trim()
      );
    const created = db.prepare('SELECT * FROM gallery_photos WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  });

  app.delete('/api/admin/gallery/:id', requirePastor, (req, res) => {
    db.prepare('DELETE FROM gallery_photos WHERE id = ?').run(Number(req.params.id));
    res.json({ ok: true });
  });

  // Settings Update
  app.put('/api/admin/settings', requirePastor, (req, res) => {
    try {
      const payload = req.body || {};
      const upsert = db.prepare(
        `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
      );

      const allowedKeys = [
        'church_name',
        'church_subtitle',
        'presidents',
        'motto',
        'email',
        'whatsapp',
        'whatsapp_link',
        'address_line1',
        'address_line2',
        'address_full',
        'facebook_url',
        'instagram_url',
        'pastor_facebook_url',
        'gallery_external_url',
        'bible_online_url',
        'maps_embed_url',
        'maps_directions_url',
        'pix_key',
        'pix_key_type',
        'pix_beneficiary',
        'pix_city',
        'schedule',
      ];

      for (const key of allowedKeys) {
        if (payload[key] !== undefined) {
          const val = key === 'schedule' ? JSON.stringify(payload[key]) : String(payload[key]);
          upsert.run(key, val);
        }
      }

      res.json(getSettings());
    } catch (err) {
      console.error('Error saving settings:', err);
      res.status(500).json({ error: 'Erro ao salvar configurações.' });
    }
  });

  // Change Pastor Password
  app.post('/api/admin/password', requirePastor, (req: AuthenticatedRequest, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    const user = db
      .prepare('SELECT id, password_hash FROM admin_users WHERE id = ?')
      .get(req.pastor!.id) as { id: number; password_hash: string } | undefined;

    if (!user || !verifyPassword(String(currentPassword), user.password_hash)) {
      res.status(401).json({ error: 'Senha atual incorreta.' });
      return;
    }
    db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(
      hashPassword(String(newPassword)),
      user.id
    );
    res.json({ ok: true });
  });

  // Local-only database backup. Download via authenticated browser session.
  app.get('/api/admin/backup', requirePastor, (req, res) => {
    if (!LOCAL_MODE) {
      res.status(403).json({ error: 'Backup disponível apenas na Central local.' });
      return;
    }
    try {
      const backupDir = path.join(dataDirectory, 'backups');
      fs.mkdirSync(backupDir, { recursive: true });
      const file = path.join(backupDir, `central-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
      db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
      res.download(file, 'central-da-igreja-backup.db');
    } catch (err) {
      console.error('Backup failed:', err);
      res.status(500).json({ error: 'Falha ao gerar backup.' });
    }
  });

  // Secure Image Upload Endpoint
  app.post('/api/admin/upload', requirePastor, (req, res) => {
    try {
      const { dataUrl } = req.body || {};
      if (typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Arquivo inválido.' });
        return;
      }
      const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) {
        res.status(400).json({ error: 'Formato não suportado. Use JPG, PNG ou WebP.' });
        return;
      }
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'A imagem deve ter no máximo 5 MB.' });
        return;
      }
      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `church-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
      const destPath = path.join(uploadsDirectory, fileName);
      fs.writeFileSync(destPath, buffer);
      res.status(201).json({ url: `/uploads/${fileName}` });
    } catch (err) {
      console.error('Error uploading image:', err);
      res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
    }
  });

  // =========================================================================
  // VITE MIDDLEWARE (DEV) OR STATIC DIST (PROD)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`O Evangelho da Paz server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
