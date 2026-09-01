const LIVE_NAMES = new Set(['live', 'prod', 'production']);

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function validateMigrationTarget({
  environment = process.env.KDN_ENV || 'sandbox',
  databaseUrl = process.env.DATABASE_URL || '',
  allowRemoteSandbox = process.env.KDN_ALLOW_REMOTE_SANDBOX_DB === '1'
} = {}) {
  const env = String(environment).trim().toLowerCase();
  if (LIVE_NAMES.has(env)) {
    throw new Error('Migration guard refuses live/production environment');
  }
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for migrations');
  }

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('Migration guard only permits PostgreSQL URLs');
  }

  const dbName = parsed.pathname.replace(/^\//, '').toLowerCase();
  if (!dbName) throw new Error('PostgreSQL database name is required');

  if (/\b(prod|production|live)\b/.test(dbName)) {
    throw new Error('Migration guard refuses production-looking database name');
  }

  if (!isLocalHost(parsed.hostname) && !allowRemoteSandbox) {
    throw new Error('Remote sandbox database requires KDN_ALLOW_REMOTE_SANDBOX_DB=1');
  }

  return {
    environment: env,
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    database: dbName,
    remote: !isLocalHost(parsed.hostname)
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const target = validateMigrationTarget();
    console.log(`Migration target accepted: env=${target.environment} host=${target.hostname} db=${target.database}`);
  } catch (error) {
    console.error(`Migration blocked: ${error.message}`);
    process.exitCode = 1;
  }
}
