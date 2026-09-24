(function () {
  const links = [
    ['/', 'Home'],
    ['/services.html', 'Services'],
    ['/about.html', 'About'],
    ['/book.html', 'Contact'],
  ];
  const path = location.pathname === '/index.html' ? '/' : location.pathname;

  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `
      <div class="wrap nav">
        <a class="brand" href="/" aria-label="Ironbark Barbers home">
          <img src="/img/logo.svg" alt="" width="40" height="40">IRONBARK
        </a>
        <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">☰</button>
        <ul class="nav-links" id="nav-links">
          ${links.map(([href, label]) =>
            `<li><a href="${href}" ${href === path ? 'aria-current="page"' : ''}>${label}</a></li>`).join('')}
          <li><a class="btn" href="/book.html">Book now</a></li>
        </ul>
      </div>`;
    const burger = document.getElementById('burger');
    const menu = document.getElementById('nav-links');
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.textContent = open ? '✕' : '☰';
    });
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="wrap">
        <div class="grid footer-grid">
          <div>
            <h3>Ironbark Barbers</h3>
            <p>Cuts, fades and beard work in the heart of Braamfontein since 2016.</p>
          </div>
          <div>
            <h3>Visit</h3>
            <ul>
              <li>42 Juta Street, Braamfontein</li>
              <li>Johannesburg, 2017</li>
              <li><a href="tel:+27115550142">011 555 0142</a></li>
              <li><a href="mailto:hello@ironbarkbarbers.example">hello@ironbarkbarbers.example</a></li>
            </ul>
          </div>
          <div>
            <h3>Opening hours</h3>
            <table>
              <tr><td>Mon–Fri</td><td>09:00–18:00</td></tr>
              <tr><td>Saturday</td><td>08:00–16:00</td></tr>
              <tr><td>Sunday</td><td>Closed</td></tr>
            </table>
          </div>
          <div>
            <h3>Links</h3>
            <ul>
              <li><a href="/services.html">Services</a></li>
              <li><a href="/about.html">About</a></li>
              <li><a href="/book.html">Book an appointment</a></li>
              <li><a href="/terms.html">Terms &amp; Conditions</a></li>
            </ul>
            <p>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener">Instagram</a> ·
              <a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a> ·
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener">TikTok</a>
            </p>
          </div>
        </div>
        <div class="copy">
          <span>© ${new Date().getFullYear()} Ironbark Barbers (Pty) Ltd. All rights reserved.</span>
          <a href="/terms.html">Terms &amp; Conditions</a>
        </div>
      </div>`;
  }
})();