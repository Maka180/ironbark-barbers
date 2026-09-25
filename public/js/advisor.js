(function () {
  const card = document.getElementById('advisor');
  if (!card) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Open the advisor when someone arrives from the home page button (/book.html#advisor)
  const openIfLinked = () => {
    if (location.hash === '#advisor') {
      card.open = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  openIfLinked();
  addEventListener('hashchange', openIfLinked);

  let services = [], barbers = [];
  const ready = Promise.all([
    fetch('/api/services').then(r => r.json()),
    fetch('/api/barbers').then(r => r.json())
  ]).then(([s, b]) => { services = s; barbers = b; }).catch(() => {});

  function showResult(data) {
    const svc = services.find(s => s.id === data.serviceId);
    const bar = barbers.find(b => b.id === data.barberId);
    if (!svc || !bar) throw new Error('unknown ids');
    const chips = [data.faceShape && `${data.faceShape} face`, data.hairType && `${data.hairType} hair`, data.density && `${data.density} density`]
      .filter(Boolean).map(c => `<span class="chip">${esc(c)}</span>`).join('');
    const out = $('advisor-result');
    out.innerHTML = `
      ${chips ? `<div class="observe">${chips}</div>` : ''}
      <h3>${data.styleIdea ? esc(data.styleIdea) + ': ' : ''}${esc(svc.name)} with ${esc(bar.name)}</h3>
      <p>${esc(data.reason)}</p>
      <p class="hint">Book as: ${esc(svc.name)} · R${svc.price} · ${svc.minutes} min</p>
      <button type="button" class="btn dark" id="advisor-use">Use this suggestion</button>`;
    out.hidden = false;
    $('advisor-use').addEventListener('click', () => {
      $('service').value = svc.id;
      $('barber').value = bar.id;
      $('service').dispatchEvent(new Event('change'));
      $('booking-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ---- Written advisor ----
  $('advisor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('advisor-msg'), btn = $('advisor-btn');
    msg.textContent = ''; $('advisor-result').hidden = true;
    const text = $('advisor-text').value.trim();
    if (text.length < 5) { msg.textContent = 'Tell us a little about your hair or the occasion.'; return; }
    btn.disabled = true; btn.textContent = 'Thinking…';
    try {
      await ready;
      const res = await fetch('/api/advisor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      if (!res.ok) { msg.textContent = data.error || 'Something went wrong. Please try again.'; return; }
      showResult(data);
    } catch (err) {
      msg.textContent = 'The Style Advisor is unavailable right now. You can still pick a service below.';
    } finally {
      btn.disabled = false; btn.textContent = 'Get a suggestion';
    }
  });

  // ---- Photo advisor ----
  // Resizing in the browser keeps uploads small and also removes hidden data such as photo location
  function resizeToJpeg(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  $('photo-file').addEventListener('change', () => {
    const f = $('photo-file').files[0], prev = $('photo-preview');
    if (!f) { prev.hidden = true; return; }
    prev.src = URL.createObjectURL(f); prev.hidden = false;
    $('photo-msg').textContent = '';
  });

  $('photo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('photo-msg'), btn = $('photo-btn');
    msg.textContent = ''; $('advisor-result').hidden = true;
    const file = $('photo-file').files[0];
    if (!file) { msg.textContent = 'Please choose a photo first.'; return; }
    if (!file.type.startsWith('image/')) { msg.textContent = 'That file is not an image.'; return; }
    if (!$('photo-consent').checked) { msg.textContent = 'Please tick the box to agree before we analyse your photo.'; return; }

    btn.disabled = true; btn.textContent = 'Analysing… this can take up to 30 seconds';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 70000); // stop waiting after 70 seconds
    try {
      await ready;
      const image = await resizeToJpeg(file, 640);
      const res = await fetch('/api/photo-advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }), signal: ctrl.signal
      });
      const data = await res.json();
      if (!res.ok) { msg.textContent = data.error || 'Something went wrong. Please try again.'; return; }
      showResult(data);
    } catch (err) {
      msg.textContent = err.name === 'AbortError'
        ? 'That took too long. Please try again, or use the written advisor.'
        : 'We could not read that photo. Try another one, or use the written advisor.';
    } finally {
      clearTimeout(timer);
      btn.disabled = false; btn.textContent = 'Analyse my photo';
    }
  });

  window.addEventListener('booking:confirmed', () => { card.hidden = true; });
})();