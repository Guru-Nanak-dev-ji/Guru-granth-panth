(() => {
  const openBtn = document.getElementById('startStory');
  const dialog = document.getElementById('storyDialog');
  const form = document.getElementById('storyForm');
  const step = document.getElementById('storyStep');
  const closeBtn = document.getElementById('storyClose');
  if (!openBtn || !dialog || !form || !step) return;

  const screens = [
    {
      title: 'तुम कौन हो? 🌱',
      body: '<label>जिस नाम से बुलाना चाहें<input name="name" maxlength="60" autocomplete="name" required></label><label>आज आप खुद को कैसे पहचानते हैं?<textarea name="identity" maxlength="280" rows="3" required></textarea></label>'
    },
    {
      title: 'आपकी रुचि किसमें है? ✨',
      body: '<div class="interest-grid">' + ['सेवा','रोज़गार','शिक्षा','परिवार','समाचार','व्यापार','तकनीक','मानव एकता'].map(x => `<label><input type="checkbox" name="interest" value="${x}"> ${x}</label>`).join('') + '</div><label>आप अभी किस समस्या पर काम करना चाहते हैं?<textarea name="goal" maxlength="280" rows="3"></textarea></label>'
    },
    {
      title: 'Human Unity Mission 🤝',
      body: '<p>KDN इंसानों को जोड़ने, सेवा और सहयोग आसान करने का प्रयास है। सफलता का कोई वादा नहीं।</p><label class="consent"><input type="checkbox" name="storyConsent" required> मेरी कहानी और उत्तर इस device के session में उपयोग करके अगला प्रश्न सुझाया जा सकता है।</label><label class="consent"><input type="checkbox" name="partnerInterest"> मुझे partnership की जानकारी दिखाएँ। यह membership या financial agreement नहीं है।</label><p class="privacy-note">आप Skip कर सकते हैं। कोई social account, पैसा या संदेश आपकी अलग permission के बिना नहीं छुआ जाएगा।</p>'
    }
  ];
  let current = 0;
  const answers = {};

  function render() {
    const s = screens[current];
    step.innerHTML = `<p class="step-count">Step ${current + 1} / ${screens.length}</p><h2>${s.title}</h2>${s.body}<div class="story-actions"><button type="button" id="storySkip">अभी नहीं</button><button type="submit" class="primary">${current === screens.length - 1 ? 'पूरा करें' : 'अगला सवाल'}</button></div>`;
    step.querySelector('#storySkip').onclick = close;
  }
  function open() { current = 0; render(); dialog.showModal(); }
  function close() { dialog.close(); }
  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  dialog.addEventListener('cancel', close);

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    for (const [key, value] of data.entries()) {
      if (key === 'interest') (answers.interest ||= []).push(value);
      else answers[key] = value;
    }
    if (current < screens.length - 1) {
      current += 1;
      render();
      return;
    }
    sessionStorage.setItem('kdnStorySession', JSON.stringify(answers));
    step.innerHTML = '<h2>स्वागत है 🧡</h2><p>आपकी कहानी इस browser session में सुरक्षित है। KDN अभी public MVP है; partnership onboarding और live AI अगले चरण में जुड़ेंगे।</p><div class="story-actions"><button type="button" id="storyDone" class="primary">KDN खोलें</button></div>';
    step.querySelector('#storyDone').onclick = close;
  });
})();