(async function () {
  const grid = document.getElementById('barber-grid');
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  try {
    const res = await fetch('/api/barbers');
    if (!res.ok) throw new Error('bad response');
    const barbers = await res.json();
    grid.innerHTML = barbers.map(b => `
      <div class="card">
        ${b.photo
          ? `<img class="portrait" src="${esc(b.photo)}" data-initial="${esc(b.name[0])}" alt="Portrait of ${esc(b.name)}, ${esc(b.role)}" width="800" height="800" loading="lazy">`
          : `<div class="avatar" aria-hidden="true">${esc(b.name[0])}</div>`}
        <h3>${esc(b.name)}</h3>
        <p class="role">${esc(b.role)}</p>
        <p>${esc(b.bio)}</p>
      </div>`).join('');

    // If a photo is missing or fails to load, show the letter tile instead of a broken image
    grid.querySelectorAll('img.portrait').forEach(img => {
      img.addEventListener('error', () => {
        const tile = document.createElement('div');
        tile.className = 'avatar';
        tile.setAttribute('aria-hidden', 'true');
        tile.textContent = img.dataset.initial;
        img.replaceWith(tile);
      });
    });
  } catch (err) {
    grid.textContent = 'We could not load the team right now.';
  }
})();