(function () {
  const dlg = document.getElementById('offer');
  if (!dlg || typeof dlg.showModal !== 'function') return;

  let seen = false;
  try { seen = localStorage.getItem('ib_offer_seen') === '1'; } catch (e) {}
  const markSeen = () => { try { localStorage.setItem('ib_offer_seen', '1'); } catch (e) {} };

  dlg.addEventListener('close', markSeen);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // click on the dark backdrop
  dlg.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => dlg.close()));

  if (!seen) setTimeout(() => { if (!document.querySelector('dialog[open]')) dlg.showModal(); }, 4000);
})();