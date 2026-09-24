(async function () {
  const box = document.getElementById('service-list');
  try {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('bad response');
    const services = await res.json();
    box.innerHTML = services.map(s => `
      <div class="svc-row">
        <div>
          <h3>${s.name}</h3>
          <p>${s.description} · ${s.minutes} min</p>
          <a href="/book.html?s=${s.id}">Book this</a>
        </div>
        <div class="price">R${s.price}</div>
      </div>`).join('');
  } catch (err) {
    box.textContent = 'We could not load the price list right now. Please call 011 555 0142.';
  }
})();