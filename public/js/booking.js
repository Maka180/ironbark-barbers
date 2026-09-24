(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const localISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const params = new URLSearchParams(location.search);
  let chosenTime = null;
  let requestId = 0;

  let services, barbers;
  try {
    [services, barbers] = await Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json())
    ]);
  } catch (e) {
    $('form-msg').textContent = 'We could not load the booking form. Please call 011 555 0142.';
    return;
  }

  $('service').innerHTML = services.map(s => `<option value="${s.id}">${esc(s.name)} – R${s.price} (${s.minutes} min)</option>`).join('');
  $('barber').innerHTML = barbers.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
  if (services.some(s => s.id === params.get('s'))) $('service').value = params.get('s');
  if (barbers.some(b => b.id === params.get('b'))) $('barber').value = params.get('b');

  const dateInput = $('date');
  dateInput.min = localISO(new Date());
  dateInput.value = localISO(new Date());

  async function loadSlots() {
    chosenTime = null;
    $('form-msg').textContent = '';
    const box = $('slots');
    if (!dateInput.value) { box.textContent = 'Pick a date to see times.'; return; }
    const my = ++requestId;
    box.textContent = 'Loading times…';
    try {
      const q = new URLSearchParams({ date: dateInput.value, barber: $('barber').value, service: $('service').value });
      const res = await fetch('/api/availability?' + q);
      const data = await res.json();
      if (my !== requestId) return; // a newer request replaced this one
      if (!res.ok) { box.textContent = data.error || 'Could not load times.'; return; }
      if (data.closed) { box.textContent = "We're closed on Sundays. Please choose another date."; return; }
      if (!data.slots.some(s => s.available)) { box.textContent = 'No times left on this date. Try another day or barber.'; return; }
      box.innerHTML = data.slots.map(s =>
        `<button type="button" class="slot" aria-pressed="false" data-time="${s.time}" ${s.available ? '' : 'disabled'}>${s.time}</button>`).join('');
    } catch (e) {
      box.textContent = 'Could not load times. Check your connection and try again.';
    }
  }

  $('slots').addEventListener('click', (e) => {
    const btn = e.target.closest('.slot');
    if (!btn || btn.disabled) return;
    document.querySelectorAll('.slot').forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    chosenTime = btn.dataset.time;
    $('form-msg').textContent = '';
  });
  ['service', 'barber', 'date'].forEach(id => $(id).addEventListener('change', loadSlots));
  loadSlots();

  $('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('form-msg');
    msg.textContent = '';
    if (!dateInput.value || !chosenTime) { msg.textContent = 'Please choose a date and an available time.'; return; }
    const payload = {
      serviceId: $('service').value, barberId: $('barber').value,
      date: dateInput.value, time: chosenTime,
      name: $('name').value, email: $('email').value, phone: $('phone').value
    };
    const btn = $('submit-btn');
    btn.disabled = true; btn.textContent = 'Booking…';
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.error || 'Something went wrong. Please try again.';
        if (res.status === 409) loadSlots();
        return;
      }
      showConfirmation(data);
    } catch (err) {
      msg.textContent = 'Could not reach the server. Please try again.';
    } finally {
      btn.disabled = false; btn.textContent = 'Confirm booking';
    }
  });

  function showConfirmation(b) {
    const pretty = new Date(b.date + 'T00:00:00').toLocaleDateString('en-ZA',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('confirm').innerHTML = `
      <h2>You're booked, ${esc(b.name.split(' ')[0])}.</h2>
      <dl>
        <dt>Service</dt><dd>${esc(b.service.name)} (R${b.service.price})</dd>
        <dt>Barber</dt><dd>${esc(b.barber.name)}</dd>
        <dt>When</dt><dd>${pretty}, ${b.start} to ${b.end}</dd>
        <dt>Where</dt><dd>42 Juta Street, Braamfontein, Johannesburg</dd>
        <dt>Reference</dt><dd>${esc(b.id)}</dd>
      </dl>
      <div class="actions" id="calendar-actions"></div>
      <p><a href="/book.html">Make another booking</a></p>`;
    $('booking-form').hidden = true;
    $('confirm').hidden = false;
    $('confirm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.dispatchEvent(new CustomEvent('booking:confirmed', { detail: b })); // Step 5 hooks in here
  }
})();