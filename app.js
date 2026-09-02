(() => {
  const input = document.getElementById('commandInput');
  const output = document.getElementById('output');
  const runBtn = document.getElementById('runBtn');
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const autoReply = document.getElementById('autoReply');
  const autoLabel = document.querySelector('.switch-row span');
  const decisionRow = document.getElementById('decisionRow');
  let provider = 'chatgpt';

  document.querySelectorAll('.provider').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.provider').forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      provider = btn.dataset.provider;
      output.textContent = `AI selected: ${provider.toUpperCase()} ✅`;
    });
  });

  function explainCommand(command) {
    const c = command.toLowerCase();
    if (c.includes('connect') || c.includes('account')) {
      return 'Account connection requested. अगला live step: हर platform की official permission/OAuth connection जोड़ना। Secret keys browser में नहीं रखेंगे।';
    }
    if (c.includes('auto') && c.includes('reply')) {
      return `Auto-reply अभी ${autoReply.checked ? 'ON' : 'OFF'} है। Live replies में “AI-assisted reply” disclosure रहेगा और user-controlled rules लागू होंगे।`;
    }
    if (c.includes('setting')) {
      return 'My AI Settings: नाम/persona, भाषा, tone, allowed accounts, reply hours, approval mode और privacy controls configure किए जाएंगे।';
    }
    if (c.includes('kdn') || c.includes('next step')) {
      return 'KDN next step: provider API backend + consented account connectors + personal AI identity profile जोड़ना।';
    }
    if (c.includes('reply')) {
      return 'Reply workflow selected: पहले AI draft, फिर approval; बाद में user चाहे तो trusted conversations के लिए auto-send enable कर सकेगा।';
    }
    return 'Command captured. इसे safe action में बदलने से पहले Preview या Apply चुनें।';
  }

  function runCommand(command) {
    const clean = (command || '').trim();
    if (!clean) {
      output.textContent = 'पहले command लिखें या 🎤 बोलें।';
      decisionRow.hidden = true;
      return;
    }
    input.value = clean;
    output.textContent = `Provider: ${provider.toUpperCase()}\nCommand: ${clean}\n\n${explainCommand(clean)}`;
    decisionRow.hidden = false;
  }

  runBtn.addEventListener('click', () => runCommand(input.value));

  document.querySelectorAll('[data-command]').forEach(btn => {
    btn.addEventListener('click', () => runCommand(btn.dataset.command));
  });

  document.querySelectorAll('[data-decision]').forEach(btn => {
    btn.addEventListener('click', () => {
      const choice = btn.dataset.decision;
      if (choice === 'apply') output.textContent += '\n\n✅ APPLY selected. Live external action तभी चलेगा जब संबंधित account/API permission connected होगी।';
      if (choice === 'preview') output.textContent += '\n\n👁 PREVIEW selected. कोई external change नहीं किया गया।';
      if (choice === 'cancel') {
        output.textContent = '✋ Cancelled. कोई external change नहीं किया गया।';
        decisionRow.hidden = true;
      }
    });
  });

  autoReply.addEventListener('change', () => {
    autoLabel.textContent = `Auto‑Reply ${autoReply.checked ? 'ON' : 'OFF'}`;
    if (autoReply.checked) {
      output.textContent = '🛡️ Auto‑Reply preference ON. यह अभी local preference है; live sending तब तक बंद है जब तक account permission, disclosure और reply rules configure नहीं होते।';
    } else {
      output.textContent = 'Auto‑Reply OFF ✅';
    }
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    voiceBtn.addEventListener('click', () => {
      voiceStatus.textContent = '🎤 सुन रहा हूँ…';
      recognition.start();
    });
    recognition.onresult = event => {
      const text = event.results[0][0].transcript;
      input.value = text;
      voiceStatus.textContent = `सुना: “${text}”`;
      runCommand(text);
    };
    recognition.onerror = event => {
      voiceStatus.textContent = `Voice error: ${event.error}. आप text command भी लिख सकते हैं।`;
    };
    recognition.onend = () => {
      if (voiceStatus.textContent === '🎤 सुन रहा हूँ…') voiceStatus.textContent = 'Voice input बंद हुआ।';
    };
  } else {
    voiceBtn.disabled = true;
    voiceStatus.textContent = 'इस browser में voice recognition उपलब्ध नहीं; text command काम करेगा।';
  }
})();
