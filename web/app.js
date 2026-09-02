let token = sessionStorage.getItem('kdn_token') || '';
const out = document.getElementById('out');
const show = (x) => out.textContent = JSON.stringify(x,null,2);
async function api(path, method='GET', body){
  const headers={'content-type':'application/json'}; if(token) headers.authorization=`Bearer ${token}`;
  const res=await fetch(path,{method,headers,body:body?JSON.stringify(body):undefined});
  let data={}; try{data=await res.json()}catch{}
  if(!res.ok) throw {status:res.status,...data}; return data;
}
function bind(id, fn){document.getElementById(id).addEventListener('click',()=>Promise.resolve(fn()).then(show).catch(show));}
bind('register',()=>api('/api/v1/auth/register','POST',{email:regEmail.value,password:regPassword.value}));
bind('login',async()=>{const r=await api('/api/v1/auth/login','POST',{email:loginEmail.value,password:loginPassword.value});token=r.token;sessionStorage.setItem('kdn_token',token);return {...r,token:'[stored in sessionStorage for sandbox demo]'};});
bind('me',()=>api('/api/v1/auth/me'));
bind('sessions',()=>api('/api/v1/auth/sessions'));
bind('logout',async()=>{const r=await api('/api/v1/auth/logout','POST');token='';sessionStorage.removeItem('kdn_token');return r;});
bind('logoutAll',async()=>{const r=await api('/api/v1/auth/logout-all','POST');token='';sessionStorage.removeItem('kdn_token');return r;});
bind('recover',()=>api('/api/v1/auth/recovery/request','POST',{email:recoveryEmail.value}));

const permissionDialog = document.getElementById('permissionDialog');
const permissionState = document.getElementById('permissionState');
const permissionKey = 'kdn_sandbox_permissions';
const getPermissions = () => {
  try { return JSON.parse(sessionStorage.getItem(permissionKey) || '{}'); }
  catch { return {}; }
};
const setPermissions = (value) => sessionStorage.setItem(permissionKey, JSON.stringify(value));
const renderPermissions = () => {
  const state = getPermissions();
  const active = Object.entries(state).filter(([,v]) => v === 'granted').map(([k]) => k);
  permissionState.textContent = active.length
    ? `Sandbox intent granted: ${active.join(', ')}`
    : 'No sandbox permissions selected yet.';
};

document.getElementById('openPermissions').addEventListener('click', () => {
  renderPermissions();
  permissionDialog.showModal();
});

// Accidental background taps must never dismiss the permission sheet.
// Intentional dismissal still exists through the explicit Done/decline controls.
permissionDialog.addEventListener('click', (event) => {
  if (event.target === permissionDialog) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const button = event.target.closest('button[data-permission]');
  if (!button) return;
  const key = button.dataset.permission;
  const action = button.dataset.action;
  const state = getPermissions();
  state[key] = action === 'allow' ? 'granted' : 'revoked';
  setPermissions(state);
  renderPermissions();
  if (key === 'bank.read' && action === 'allow') {
    show({
      status: 'sandbox_intent_recorded',
      permission: 'bank.read',
      linked: false,
      next: 'Configure an official Open-Banking/OAuth provider. KDN must never collect your bank password, PIN, OTP or CVV.',
      moneyMovementAuthorized: false
    });
  }
});

// Browser Escape/cancel is treated as an explicit decline path, not an accidental
// background tap. Prevent the browser's implicit close so the app can keep consent
// handling deterministic and auditable.
permissionDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  show({ status: 'permission_dialog_still_open', reason: 'explicit_choice_required' });
});

document.getElementById('closePermissions').addEventListener('click', () => permissionDialog.close());
