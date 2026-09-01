import http from 'node:http';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number(process.env.PORT || 3000);
const ENV = process.env.KDN_ENV || 'sandbox';
if (ENV === 'live') throw new Error('Wave 1 sandbox service refuses KDN_ENV=live');

const users = new Map();
const sessions = new Map();
const attempts = new Map();

const opaque = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const now = () => new Date().toISOString();
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
};
const safeEq = (a, b) => {
  const aa = Buffer.from(a, 'hex'); const bb = Buffer.from(b, 'hex');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
const json = (res, code, body) => {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'self'; object-src 'none'; frame-ancestors 'none'"
  }); res.end(data);
};
const readBody = async (req) => {
  let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 32_768) throw new Error('body_too_large'); }
  return raw ? JSON.parse(raw) : {};
};
const normalizeEmail = (v='') => String(v).trim().toLowerCase();
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const passwordOkay = (v='') => typeof v === 'string' && v.length >= 12 && v.length <= 128;
const bearer = (req) => (req.headers.authorization || '').replace(/^Bearer\s+/i,'');
const currentSession = (req) => {
  const token = bearer(req); if (!token) return null;
  const s = sessions.get(token); if (!s || s.revokedAt) return null;
  return { token, ...s };
};
const throttle = (key) => {
  const t = Date.now(); const state = attempts.get(key) || { count:0, start:t };
  if (t - state.start > 60_000) { state.count = 0; state.start = t; }
  state.count += 1; attempts.set(key, state); return state.count <= 10;
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (req.method === 'GET' && url.pathname === '/api/v1/live') return json(res,200,{status:'ok', environment:ENV, deploymentClaim:false});
    if (req.method === 'GET' && url.pathname === '/api/v1/ready') return json(res,200,{status:'ready', storage:'ephemeral-memory', environment:ENV});
    if (req.method === 'GET' && url.pathname === '/api/v1/health') return json(res,200,{status:'ok', users:users.size, sessions:[...sessions.values()].filter(s=>!s.revokedAt).length});

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/register') {
      const body = await readBody(req); const email = normalizeEmail(body.email); const password = body.password;
      if (!validEmail(email) || !passwordOkay(password)) return json(res,400,{error:'invalid_registration'});
      if (users.has(email)) return json(res,409,{error:'account_exists'});
      const id = opaque('usr'); const pw = hashPassword(password);
      users.set(email,{id,email,pw,createdAt:now(),status:'active'});
      return json(res,201,{user:{id,email}, environment:ENV});
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/login') {
      const ip = req.socket.remoteAddress || 'unknown'; if (!throttle(`login:${ip}`)) return json(res,429,{error:'rate_limited'});
      const body = await readBody(req); const email = normalizeEmail(body.email); const user = users.get(email);
      const candidate = hashPassword(String(body.password || ''), user?.pw.salt || crypto.randomBytes(16).toString('hex'));
      if (!user || !safeEq(candidate.hash, user.pw.hash)) return json(res,401,{error:'invalid_credentials'});
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token,{id:opaque('ses'),userId:user.id,createdAt:now(),lastSeenAt:now(),revokedAt:null});
      return json(res,200,{token,session:{id:sessions.get(token).id,userId:user.id},environment:ENV});
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/me') {
      const s = currentSession(req); if (!s) return json(res,401,{error:'unauthorized'});
      const user = [...users.values()].find(u=>u.id===s.userId); if (!user) return json(res,401,{error:'unauthorized'});
      sessions.get(s.token).lastSeenAt = now(); return json(res,200,{user:{id:user.id,email:user.email},session:{id:s.id,createdAt:s.createdAt}});
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/sessions') {
      const s = currentSession(req); if (!s) return json(res,401,{error:'unauthorized'});
      const list = [...sessions.values()].filter(x=>x.userId===s.userId).map(x=>({id:x.id,createdAt:x.createdAt,lastSeenAt:x.lastSeenAt,revokedAt:x.revokedAt}));
      return json(res,200,{sessions:list});
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/logout') {
      const s = currentSession(req); if (!s) return json(res,204,{});
      sessions.get(s.token).revokedAt = now(); return json(res,200,{status:'revoked'});
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/logout-all') {
      const s = currentSession(req); if (!s) return json(res,401,{error:'unauthorized'});
      for (const entry of sessions.values()) if (entry.userId===s.userId && !entry.revokedAt) entry.revokedAt=now();
      return json(res,200,{status:'all_sessions_revoked'});
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/recovery/request') {
      // Deliberately generic: no account-enumeration signal and no email is sent in sandbox Wave 1.
      await readBody(req); return json(res,202,{status:'accepted',message:'If an eligible account exists, recovery may proceed through an authorized channel.',environment:ENV});
    }

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const here = path.dirname(fileURLToPath(import.meta.url));
      const html = await readFile(path.join(here,'../web/index.html'));
      res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"}); return res.end(html);
    }
    if (req.method === 'GET' && url.pathname === '/app.js') {
      const here = path.dirname(fileURLToPath(import.meta.url)); const js = await readFile(path.join(here,'../web/app.js'));
      res.writeHead(200,{'content-type':'text/javascript; charset=utf-8','cache-control':'no-store'}); return res.end(js);
    }
    return json(res,404,{error:'not_found'});
  } catch (e) {
    if (e?.message === 'body_too_large') return json(res,413,{error:'request_too_large'});
    return json(res,400,{error:'bad_request'});
  }
});

server.listen(PORT,()=>console.log(`KDN Wave 1 ${ENV} listening on ${PORT}`));
