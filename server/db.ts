import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { SiteSettings } from '../src/types/church.ts';

// Local Windows installation stores mutable data outside the application directory.
// Override CHURCH_DATA_DIR for portable/testing installations.
const LOCAL_MODE = process.env.CENTRAL_LOCAL_MODE === '1';
const STORAGE_ROOT = process.env.CHURCH_DATA_DIR
  ? path.resolve(process.env.CHURCH_DATA_DIR)
  : LOCAL_MODE
    ? path.join(process.env.APPDATA || path.join(process.env.USERPROFILE || process.cwd(), 'AppData', 'Roaming'), 'CentralDaIgreja')
    : path.resolve(process.cwd());
const DATA_DIR = LOCAL_MODE || process.env.CHURCH_DATA_DIR ? path.join(STORAGE_ROOT, 'data') : path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = LOCAL_MODE || process.env.CHURCH_DATA_DIR ? path.join(STORAGE_ROOT, 'uploads') : path.resolve(process.cwd(), 'uploads');
const DB_PATH = path.join(DATA_DIR, 'evangelho_da_paz.db');
const SECRET_PATH = path.join(DATA_DIR, '.session_secret');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const uploadsDirectory = UPLOADS_DIR;
export const dataDirectory = DATA_DIR;
export const databasePath = DB_PATH;

export function getSessionSecret(): string {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16) {
    return process.env.SESSION_SECRET.trim();
  }
  if (fs.existsSync(SECRET_PATH)) {
    return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  }
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_PATH, generated, { mode: 0o600 });
  return generated;
}

export const db = new DatabaseSync(DB_PATH);

export const DEFAULT_SETTINGS: SiteSettings = {
  church_name: 'O Evangelho da Paz',
  church_subtitle: 'A Comunidade Evangélica Pentecostal',
  presidents: 'Pr. Robson Andrade e Pra. Simone Andrade',
  motto: 'Ide por todo mundo e pregai o evangelho a toda criatura. (Marcos 16:15)',
  email: 'oevangelhodapaz@gmail.com',
  whatsapp: '+55 11 98364-6182',
  whatsapp_link: 'https://wa.me/5511983646182',
  address_line1: 'R. Profa. Nina Stocco, 529',
  address_line2: 'Jardim Catanduva · São Paulo – SP',
  address_full: 'R. Profa. Nina Stocco, 529 - Jardim Catanduva, São Paulo - SP',
  facebook_url: 'https://www.facebook.com/oevangelhodapaz',
  instagram_url: 'https://www.instagram.com/oevangelhodapaz',
  pastor_facebook_url: 'https://www.facebook.com/Pr.RobsonAndrade',
  gallery_external_url: 'https://www.facebook.com/oevangelhodapaz/photos',
  bible_online_url: 'https://www.bibliaonline.com.br/acf',
  maps_embed_url:
    'https://www.google.com/maps/embed?pb=!4v1795122116910!6m8!1m7!1ssOJ51AxXSOTjxm7gYwuXVQ!2m2!1d-23.62867155246288!2d-46.76040549956484!3f61.27!4f0!5f0.7820865974627469',
  maps_directions_url:
    'https://www.google.com/maps/search/?api=1&query=R.+Profa.+Nina+Stocco,+529+-+Jardim+Catanduva,+S%C3%A3o+Paulo+-+SP',
  pix_key: '',
  pix_key_type: 'CNPJ',
  pix_beneficiary: 'Comunidade Evangélica Pentecostal O Evangelho da Paz',
  pix_city: 'SAO PAULO',
  schedule: [
    { day: 'Terça-feira', time: '20:00h', title: 'Oração' },
    { day: 'Quarta-feira', time: '19:30h', title: 'Ensinamento Bíblico' },
    { day: 'Sexta-feira', time: '19:30h', title: 'Campanhas' },
    { day: 'Domingo', time: '09:00h', title: 'E.B.D. (Escola Bíblica Dominical)' },
    { day: 'Domingo', time: '10:00h', title: 'Culto da Família' },
  ],
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export function initDatabase(): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'pastor',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK (category IN ('palavra_do_dia', 'estudo_biblico', 'frase_reflexao')),
      content TEXT NOT NULL,
      bible_reference TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      published_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      event_date TEXT NOT NULL DEFAULT '',
      event_time TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT 'Templo Sede',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_highlighted INTEGER NOT NULL DEFAULT 0,
      expires_at TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS prayer_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      whatsapp TEXT NOT NULL DEFAULT '',
      request_text TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      privacy_consent INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'prayed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery_albums (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      event_date TEXT NOT NULL DEFAULT '', cover_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      event_date TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Backwards-compatible migration: preserve all existing individual photos.
  const galleryColumns = db.prepare('PRAGMA table_info(gallery_photos)').all() as Array<{name:string}>;
  if (!galleryColumns.some(c => c.name === 'album_id')) db.exec('ALTER TABLE gallery_photos ADD COLUMN album_id INTEGER REFERENCES gallery_albums(id) ON DELETE SET NULL');
  const eventColumns = db.prepare('PRAGMA table_info(events)').all() as Array<{name:string}>;
  if (!eventColumns.some(c => c.name === 'is_highlighted')) db.exec('ALTER TABLE events ADD COLUMN is_highlighted INTEGER NOT NULL DEFAULT 0');

  // Seed default site settings if missing
  const existingSettings = db.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
  if (existingSettings.count === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      insertSetting.run(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
  }

  // Optional initial pastor seed via environment variables (never hardcoded in frontend)
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (adminCount.count === 0 && process.env.PASTOR_ADMIN_EMAIL && process.env.PASTOR_ADMIN_PASSWORD) {
    db.prepare('INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      'Pr. Robson Andrade',
      process.env.PASTOR_ADMIN_EMAIL.trim().toLowerCase(),
      hashPassword(process.env.PASTOR_ADMIN_PASSWORD),
      'pastor'
    );
  }

  // Seed initial editable publications if empty
  const pubCount = db.prepare('SELECT COUNT(*) as count FROM publications').get() as { count: number };
  if (pubCount.count === 0) {
    const insertPub = db.prepare(`
      INSERT INTO publications (title, slug, category, content, bible_reference, image_url, published_date, status, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPub.run(
      'Confie no Senhor',
      'confie-no-senhor',
      'palavra_do_dia',
      '“Entrega o teu caminho ao Senhor, confia nele, e ele agirá.”\n\nMuitas vezes nos deparamos com caminhos incertos e desafios que parecem maiores do que as nossas forças. No entanto, o Salmo 37 nos convida a fazer uma escolha diária de fé: entregar o controle ao Senhor.\n\nQuando entregamos o nosso caminho a Deus e descansamos em Sua fidelidade, Ele mesmo age com sabedoria, justiça e paz no tempo perfeito. Hoje, coloque diante de Deus a sua família, seus projetos e suas orações — e confie.',
      'Salmos 37:5',
      '/src/assets/images/palavra_biblia_luz_1795123820778.jpg',
      '2026-11-24',
      'published',
      1
    );

    insertPub.run(
      'A Fortaleza da Fé',
      'a-fortaleza-da-fe',
      'estudo_biblico',
      'A fé cristã não é um sentimento passageiro, mas uma convicção firme baseada nas promessas eternas de Deus. Em Efésios 6:16, Paulo nos ensina a tomar o escudo da fé para apagar todos os dardos inflamados do maligno.\n\n1. A fé nasce pelo ouvir a Palavra de Deus (Romanos 10:17).\n2. A fé persevera mesmo quando os olhos naturais ainda não veem a resposta.\n3. A fé se fortalece na comunhão da igreja e na vida de oração.\n\nPermaneça firme na Rocha que é Cristo Jesus.',
      'Efésios 6:16',
      '/src/assets/images/estudo_cruz_fe_1795123819357.jpg',
      '2026-11-21',
      'published',
      1
    );

    insertPub.run(
      'Entendendo a Graça de Deus',
      'entendendo-a-graca-de-deus',
      'estudo_biblico',
      'A graça é o favor imerecido de Deus derramado sobre nós por meio de Jesus Cristo. Não somos salvos por méritos próprios, mas pela misericórdia do Pai que nos alcança e nos transforma.\n\nAo compreendermos a profundidade da graça, deixamos para trás o peso da culpa e passamos a servir ao Senhor com gratidão, alegria e santidade.',
      'Efésios 2:8-9',
      '/src/assets/images/palavra_biblia_luz_1795123820778.jpg',
      '2026-11-17',
      'published',
      1
    );

    insertPub.run(
      'Crescendo na Palavra',
      'crescendo-na-palavra',
      'estudo_biblico',
      'Assim como uma semente precisa de solo fértil, água e luz para crescer e dar frutos, a vida espiritual necessita do alimento diário das Escrituras.\n\nDedicar tempo diário à leitura bíblica, ao estudo em comunidade na Escola Bíblica Dominical e à prática do Evangelho produz maturidade espiritual e firmeza diante das provações.',
      '1 Pedro 2:2',
      '/src/assets/images/estudo_broto_palavra_1795123819275.jpg',
      '2026-11-14',
      'published',
      1
    );

    insertPub.run(
      'A Paz que Excede Todo Entendimento',
      'a-paz-que-excede-todo-entendimento',
      'frase_reflexao',
      'Não andeis ansiosos por coisa alguma; antes, em tudo, sejam os vossos pedidos conhecidos diante de Deus pela oração e pela súplica, com ações de graças. A paz de Deus guardará o vosso coração e a vossa mente em Cristo Jesus.',
      'Filipenses 4:6-7',
      '/src/assets/images/hero_sky_clouds_1795123819266.jpg',
      '2026-11-12',
      'published',
      1
    );
  }

  // Seed initial demo events (clearly marked as demonstrative/unconfirmed dates)
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
  if (eventCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (name, event_date, event_time, description, image_url, location, status, is_demo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'Vigília de Oração',
      '',
      'Sexta-feira, às 22:00h',
      'Evento demonstrativo — noite de clamor, louvor e intercessão pelas famílias. Data oficial a ser confirmada pela liderança pastoral.',
      '/src/assets/images/vigilia_adoracao_maos_1795123818998.jpg',
      'Templo Sede',
      'published',
      1
    );

    insertEvent.run(
      'Culto da Família Especial',
      '',
      'Domingo, às 10:00h',
      'Evento demonstrativo — celebração especial voltada para toda a família com ministração da Palavra e comunhão. Data oficial a ser confirmada.',
      '/src/assets/images/palavra_biblia_luz_1795123820778.jpg',
      'Templo Sede',
      'published',
      1
    );
  }

  // Seed initial gallery placeholders
  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery_photos').get() as { count: number };
  if (galleryCount.count === 0) {
    const insertGallery = db.prepare(`
      INSERT INTO gallery_photos (title, caption, image_url, event_date)
      VALUES (?, ?, ?, ?)
    `);
    insertGallery.run(
      'Noite de Adoração e Clamor',
      'Momento de oração e comunhão no Templo Sede (imagem ilustrativa substituível na Área do Pastor).',
      '/src/assets/images/vigilia_adoracao_maos_1795123818998.jpg',
      'Registro ilustrativo'
    );
    insertGallery.run(
      'Ensinamento da Palavra',
      'Estudo bíblico e edificação espiritual da igreja (imagem ilustrativa substituível na Área do Pastor).',
      '/src/assets/images/palavra_biblia_luz_1795123820778.jpg',
      'Registro ilustrativo'
    );
    insertGallery.run(
      'Fé que Move Montanhas',
      'A cruz como símbolo de esperança e salvação (imagem ilustrativa substituível na Área do Pastor).',
      '/src/assets/images/estudo_cruz_fe_1795123819357.jpg',
      'Registro ilustrativo'
    );
  }
}

export function getSettings(): SiteSettings {
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
  const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.key === 'schedule') {
      try {
        result.schedule = JSON.parse(row.value);
      } catch {
        result.schedule = DEFAULT_SETTINGS.schedule;
      }
    } else {
      result[row.key] = row.value;
    }
  }
  return result as unknown as SiteSettings;
}
