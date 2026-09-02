(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const dialog = $('#journeyDialog');
  const form = $('#journeyForm');
  const body = $('#journeyStep');
  const title = $('#dialogTitle');
  const label = $('#stepLabel');
  const next = $('#nextBtn');
  const toast = $('#toast');
  const state = { step: 0, answers: {}, persona: 'तर्क सिंह' };
  let installPrompt;

  const steps = [
    { label:'पहला कदम • आपकी कहानी', title:'तुम कौन हो?', html:`<p>नाम से आगे—आज आप अपने जीवन के किस अध्याय में हैं?</p><label>आपको किस नाम से बुलाएँ?<input type="text" name="name" maxlength="60" autocomplete="name" required></label><label>अपने बारे में एक बात जो दुनिया को समझनी चाहिए<textarea name="identity" rows="4" maxlength="320" required></textarea></label>` },
    { label:'दूसरा कदम • आपकी दिशा', title:'अभी आपको क्या पुकार रहा है?', html:`<div class="choice-grid">${['सेवा','रोज़गार','शिक्षा','परिवार','समाचार','व्यापार','तकनीक','मानव एकता','कला व मनोरंजन','शासन व समाज'].map(x=>`<label class="choice"><input type="checkbox" name="interest" value="${x}"> ${x}</label>`).join('')}</div><label>अगले 30 दिनों में आप क्या बदलना चाहते हैं?<textarea name="goal" rows="3" maxlength="320"></textarea></label>` },
    { label:'तीसरा कदम • आपकी अनुमति', title:'आपका रास्ता, आपका नियंत्रण', html:`<p>KDN आपके उत्तरों से अनुभव को उपयोगी बनाएगा। यह कोई सफलता, आय या परिणाम की गारंटी नहीं है।</p><label class="choice"><input type="checkbox" name="sessionConsent" required> इस browser session में मेरे उत्तरों से अगला सुझाव बनाया जा सकता है।</label><label class="choice"><input type="checkbox" name="partnerInfo"> मुझे voluntary partnership और Human Unity Mission की जानकारी दिखाएँ।</label><p>Partnership अपने-आप शुरू नहीं होगी। किसी account, payment या public post के लिए अलग अनुमति जरूरी होगी।</p>` }
  ];

  function showToast(message){ toast.textContent=message; toast.hidden=false; clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.hidden=true,3200); }
  function render(){
    const s=steps[state.step]; label.textContent=s.label; title.textContent=s.title; body.innerHTML=s.html;
    next.textContent=state.step===steps.length-1?'मेरी KDN यात्रा बनाएँ':'अगला कदम';
  }
  function openJourney(){ state.step=0; state.answers={}; render(); dialog.showModal(); }
  function saveCurrent(){
    const data=new FormData(form);
    const interests=data.getAll('interest');
    for(const [k,v] of data.entries()) if(k!=='interest') state.answers[k]=v;
    if(interests.length) state.answers.interests=interests;
  }
  $('#startJourney').addEventListener('click',openJourney);
  $('#closeDialog').addEventListener('click',()=>dialog.close());
  $('#laterBtn').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity()) return; saveCurrent();
    if(state.step<steps.length-1){ state.step++; render(); return; }
    sessionStorage.setItem('kdnJourney',JSON.stringify(state.answers));
    dialog.close(); showToast(`स्वागत है ${state.answers.name||''} 🧡 आपकी यात्रा तैयार है।`);
  });

  $('#exploreBtn').addEventListener('click',()=>$('#worlds').scrollIntoView({behavior:'smooth'}));
  $$('.persona').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.persona').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});
    btn.classList.add('active');btn.setAttribute('aria-pressed','true');
    const tark=btn.dataset.persona==='tark'; state.persona=tark?'तर्क सिंह':'भावना कौर';
    $('#personaNote').textContent=tark?'तर्क सिंह आपके विचार को सवालों, विकल्पों और व्यावहारिक अगले कदम में बदलेंगे।':'भावना कौर आपकी कहानी, भावनाओं और लोगों से सहयोग का रास्ता समझने में मदद करेंगी।';
  }));
  $$('.world-card').forEach(btn=>btn.addEventListener('click',()=>showToast(`${btn.dataset.world} का प्रवेश-द्वार तैयार है; पूर्ण module अगली release में खुलेगा।`)));
  $$('.chip').forEach(btn=>btn.addEventListener('click',()=>$('#sparkReply').textContent=`${btn.dataset.reaction} — अच्छा चुनाव। अब एक वाक्य में बताइए: बदलाव की शुरुआत कहाँ से हो?`));
  $$('.nav-item[data-target]').forEach(btn=>btn.addEventListener('click',()=>{ const el=document.getElementById(btn.dataset.target); if(el) el.scrollIntoView({behavior:'smooth'}); }));
  $('#askAi').addEventListener('click',()=>showToast(`${state.persona} जल्द आपकी बातचीत यहीं जारी रखेंगे।`));
  $('#meBtn').addEventListener('click',openJourney);
  $('#languageBtn').addEventListener('click',()=>showToast('हिंदी • ਪੰਜਾਬੀ • English • اردو — language switch अगली release में।'));
  $('#profileBtn').addEventListener('click',openJourney);

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false});
  $('#installBtn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();