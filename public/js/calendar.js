window.addEventListener('booking:confirmed', (e) => {
  const b = e.detail;
  const box = document.getElementById('calendar-actions');
  if (!box) return;

  const stamp = (t) => b.date.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
  const google = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE',
    text: `${b.service.name} at Ironbark Barbers`,
    dates: `${stamp(b.start)}/${stamp(b.end)}`,
    ctz: 'Africa/Johannesburg',
    location: 'Ironbark Barbers, 42 Juta Street, Braamfontein, Johannesburg, 2017',
    details: `${b.service.name} with ${b.barber.name}. Price R${b.service.price}, pay in shop. Reference ${b.id}. To change or cancel (at least 4 hours ahead) call 011 555 0142.`
  }).toString();

  box.innerHTML = `
    <a class="btn dark" href="${google}" target="_blank" rel="noopener">Add to Google Calendar</a>
    <a class="btn dark" href="/api/calendar.ics?${new URLSearchParams({ service: b.service.id, barber: b.barber.id, date: b.date, time: b.start, ref: b.id })}">Add to Apple / Outlook Calendar</a>`;
});