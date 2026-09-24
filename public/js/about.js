(async function () {
  const grid = document.getElementById('barber-grid');
  try {
    const res = await fetch('/api/barbers');
    if (!res.ok) throw new Error('bad response');
    const barbers = await res.json();
    grid.innerHTML = barbers.map(b => `
      <div class="card">
        <div class="avatar" aria-hidden="true">${b.name[0]}</div>
        <h3>${b.name}</h3>
        <p class="role">${b.role}</p>
        <p>${b.bio}</p>
      </div>`).join('');
  } catch (err) {
    grid.textContent = 'We could not load the team right now.';
  }
})();