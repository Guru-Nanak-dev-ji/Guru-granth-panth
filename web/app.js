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
