import 'dotenv/config';
import { createHmac, pbkdf2Sync, randomUUID, timingSafeEqual } from 'crypto';
import express from 'express';
import { existsSync, mkdirSync } from 'fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const dbPath = process.env.SQLITE_PATH
  ? path.resolve(__dirname, process.env.SQLITE_PATH)
  : path.join(dataDir, 'appoconn.sqlite');
const port = Number(process.env.PORT || process.env.APP_PORT || 8080);

const SESSION_COOKIE_NAME = 'appoconn_admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'apc_admin_local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'APPOconn#Inquiry2026$Local';
const COOKIE_SIGNING_SECRET =
  process.env.ADMIN_COOKIE_SECRET || 'appoconn-local-admin-cookie-secret-2026';

mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    inquiry_details TEXT,
    total_items INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inquiry_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_category TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    selections_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
  );
`);

const insertInquiryStatement = db.prepare(`
  INSERT INTO inquiries (
    contact_name,
    company_name,
    work_email,
    phone_number,
    inquiry_details,
    total_items,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertInquiryItemStatement = db.prepare(`
  INSERT INTO inquiry_items (
    inquiry_id,
    product_id,
    product_name,
    product_category,
    quantity,
    selections_json,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const listInquiryRowsStatement = db.prepare(`
  SELECT
    i.id,
    i.contact_name,
    i.company_name,
    i.work_email,
    i.phone_number,
    i.inquiry_details,
    i.total_items,
    i.created_at,
    ii.id AS item_id,
    ii.product_id,
    ii.product_name,
    ii.product_category,
    ii.quantity,
    ii.selections_json,
    ii.created_at AS item_created_at
  FROM inquiries i
  LEFT JOIN inquiry_items ii ON ii.inquiry_id = i.id
  ORDER BY i.created_at DESC, ii.id ASC
`);

const sessions = new Map();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

function toSafeText(value, maxLength) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  return toSafeText(value, 160).toLowerCase();
}

function parseCookieHeader(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function signCookieValue(rawValue) {
  return createHmac('sha256', COOKIE_SIGNING_SECRET).update(rawValue).digest('hex');
}

function makeSessionCookie(token, request) {
  const signedValue = `${token}.${signCookieValue(token)}`;
  const segments = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(signedValue)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];

  const forwardedProto = String(request.headers['x-forwarded-proto'] || '');
  const isSecure = request.secure || forwardedProto.includes('https');
  if (isSecure) {
    segments.push('Secure');
  }

  return segments.join('; ');
}

function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function createSession(username) {
  cleanupExpiredSessions();
  const token = randomUUID();
  sessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function getSessionFromRequest(request) {
  cleanupExpiredSessions();

  const cookies = parseCookieHeader(request.headers.cookie);
  const cookieValue = cookies[SESSION_COOKIE_NAME];
  if (!cookieValue) {
    return null;
  }

  const [token, signature] = cookieValue.split('.');
  if (!token || !signature) {
    return null;
  }

  const expectedSignature = signCookieValue(token);
  const providedBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { token, ...session };
}

function requireAdminAuth(request, response, next) {
  const session = getSessionFromRequest(request);
  if (!session) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  request.adminSession = session;
  next();
}

function verifyAdminPassword(password) {
  const salt = Buffer.from('appoconn-admin-password-salt', 'utf8');
  const expected = pbkdf2Sync(ADMIN_PASSWORD, salt, 120000, 64, 'sha512');
  const supplied = pbkdf2Sync(String(password || ''), salt, 120000, 64, 'sha512');
  return timingSafeEqual(expected, supplied);
}

function formatInquiryRows() {
  const rows = listInquiryRowsStatement.all();
  const inquiryMap = new Map();

  rows.forEach((row) => {
    if (!inquiryMap.has(row.id)) {
      inquiryMap.set(row.id, {
        id: row.id,
        contactName: row.contact_name,
        companyName: row.company_name,
        workEmail: row.work_email,
        phoneNumber: row.phone_number,
        inquiryDetails: row.inquiry_details,
        totalItems: row.total_items,
        createdAt: row.created_at,
        items: [],
      });
    }

    if (row.item_id) {
      inquiryMap.get(row.id).items.push({
        id: row.item_id,
        productId: row.product_id,
        productName: row.product_name,
        productCategory: row.product_category,
        quantity: row.quantity,
        selections: JSON.parse(row.selections_json || '{}'),
        createdAt: row.item_created_at,
      });
    }
  });

  return Array.from(inquiryMap.values());
}

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.post('/api/inquiries', (request, response) => {
  try {
    const contactName = toSafeText(request.body.contactName, 120);
    const companyName = toSafeText(request.body.companyName, 160);
    const workEmail = normalizeEmail(request.body.workEmail);
    const phoneNumber = toSafeText(request.body.phoneNumber, 60);
    const inquiryDetails = toSafeText(request.body.inquiryDetails, 2000);
    const incomingItems = Array.isArray(request.body.items) ? request.body.items : [];

    const items = incomingItems
      .map((item) => ({
        productId: toSafeText(item.productId, 120),
        productName: toSafeText(item.productName, 200),
        productCategory: toSafeText(item.productCategory, 120),
        quantity: Math.max(1, Math.min(Number(item.quantity) || 1, 999)),
        selections:
          item.selections && typeof item.selections === 'object' && !Array.isArray(item.selections)
            ? item.selections
            : {},
      }))
      .filter((item) => item.productId && item.productName);

    if (!contactName || !companyName || !workEmail || !phoneNumber || items.length === 0) {
      response.status(400).json({ error: 'Missing required inquiry fields.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      response.status(400).json({ error: 'Please provide a valid work email.' });
      return;
    }

    const createdAt = new Date().toISOString();

    db.exec('BEGIN');
    try {
      const result = insertInquiryStatement.run(
        contactName,
        companyName,
        workEmail,
        phoneNumber,
        inquiryDetails,
        items.length,
        createdAt,
      );

      for (const item of items) {
        insertInquiryItemStatement.run(
          result.lastInsertRowid,
          item.productId,
          item.productName,
          item.productCategory,
          item.quantity,
          JSON.stringify(item.selections),
          createdAt,
        );
      }

      db.exec('COMMIT');

      response.status(201).json({
        inquiryId: result.lastInsertRowid,
        createdAt,
      });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to save inquiry:', error);
    response.status(500).json({ error: 'Unable to save inquiry right now.' });
  }
});

app.post('/api/admin/login', (request, response) => {
  const username = toSafeText(request.body.username, 120);
  const password = String(request.body.password || '');

  if (username !== ADMIN_USERNAME || !verifyAdminPassword(password)) {
    response.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  const token = createSession(username);
  response.setHeader('Set-Cookie', makeSessionCookie(token, request));
  response.status(200).json({ username });
});

app.post('/api/admin/logout', (request, response) => {
  const session = getSessionFromRequest(request);
  if (session) {
    sessions.delete(session.token);
  }

  response.setHeader('Set-Cookie', clearSessionCookie());
  response.status(200).json({ ok: true });
});

app.get('/api/admin/session', (request, response) => {
  const session = getSessionFromRequest(request);
  if (!session) {
    response.status(401).json({ error: 'Unauthorized' });
    return;
  }

  response.status(200).json({ username: session.username });
});

app.get('/api/admin/inquiries', requireAdminAuth, (_request, response) => {
  try {
    response.status(200).json({ inquiries: formatInquiryRows() });
  } catch (error) {
    console.error('Failed to load inquiries:', error);
    response.status(500).json({ error: 'Unable to load inquiries right now.' });
  }
});

if (existsSync(distDir)) {
  app.use(
    express.static(distDir, {
      index: false,
      maxAge: '1h',
      setHeaders(response, filePath) {
        if (filePath.endsWith('index.html')) {
          response.setHeader('Cache-Control', 'no-cache');
        }
      },
    }),
  );

  app.get('*', (_request, response) => {
    response.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('*', (_request, response) => {
    response.status(404).json({
      error: 'Frontend build not found. Run `npm run build` for production or use Vite in development.',
    });
  });
}

app.listen(port, '0.0.0.0', () => {
  const mode = existsSync(distDir) ? 'static frontend + API' : 'API only';
  console.log(`APPOCONN server listening on http://0.0.0.0:${port} (${mode})`);
  console.log(`SQLite database: ${dbPath}`);
});
