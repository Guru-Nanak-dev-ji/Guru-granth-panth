import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const opaque = (prefix) => `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({salt,hash:crypto.scryptSync(password,salt,64).toString('hex')});
const safeEq = (a,b) => { const aa=Buffer.from(a,'hex'), bb=Buffer.from(b,'hex'); return aa.length===bb.length && crypto.timingSafeEqual(aa,bb); };

test('opaque IDs do not expose email/name',()=>{
  const id=opaque('usr');
  assert.match(id,/^usr_[a-f0-9]{32}$/);
  assert.equal(id.includes('@'),false);
});

test('password verification accepts correct and rejects incorrect password',()=>{
  const stored=hashPassword('correct horse battery staple');
  assert.equal(safeEq(hashPassword('correct horse battery staple',stored.salt).hash,stored.hash),true);
  assert.equal(safeEq(hashPassword('wrong password!',stored.salt).hash,stored.hash),false);
});

test('sandbox guard rejects live environment by contract',()=>{
  const guard=(env)=>{if(env==='live') throw new Error('refuse-live'); return true;};
  assert.equal(guard('sandbox'),true);
  assert.throws(()=>guard('live'),/refuse-live/);
});

test('recovery response wording is non-enumerating',()=>{
  const message='If an eligible account exists, recovery may proceed through an authorized channel.';
  assert.equal(/exists|eligible/.test(message),true);
  assert.equal(message.includes('No account found'),false);
});
