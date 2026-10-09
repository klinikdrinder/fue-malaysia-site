/* FUE Malaysia – Malaysia ads landing. Calm motion: native scrolling, no scroll-driven or looping animation.
   The only motion is a 0.2s opacity fade on a few blocks the first time they enter the viewport
   (skipped entirely when prefers-reduced-motion is set). */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const navH = () => $('#nav').offsetHeight;
  function go(hash) {
    const t = hash === '#top' ? 0 : $(hash); if (t === null) return;
    window.scrollTo({ top: t === 0 ? 0 : t.getBoundingClientRect().top + scrollY - navH() - 8, behavior: 'auto' });
  }
  $$('a[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (!h || h[0] !== '#') return;
    e.preventDefault(); document.body.classList.remove('menu-open'); $('#burger').setAttribute('aria-expanded', 'false');
    if (h === '#faq-price') { const q = $('#faq-price'); if (q && !q.classList.contains('open')) q.querySelector('button').click(); }
    go(h);
  }));
  $('#burger').addEventListener('click', () => { const o = document.body.classList.toggle('menu-open'); $('#burger').setAttribute('aria-expanded', o); });

  /* light first-view fade (opacity only, 0.2s). Photos stay visible even if JS is late. */
  const blocks = $$('[data-reveal]');
  $$('[data-reveal]').filter(el => el.querySelector('img,picture')).forEach(el => el.classList.add('in'));
  if (RM || !('IntersectionObserver' in window)) blocks.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -5% 0px' });
    blocks.forEach(el => io.observe(el));
  }

  /* mobile CTA bar: shown after the hero, hidden near the form */
  const bar = $('#mbar'), hero = $('.hero'), form = $('#consult');
  const upd = () => { const y = scrollY + innerHeight; bar.classList.toggle('show', scrollY > hero.offsetTop + hero.offsetHeight * .6 && y < form.offsetTop + innerHeight * .2); };
  addEventListener('scroll', upd, { passive: true }); upd();

  initUI();

  function initUI() {
    /* gallery expand */
    const gal = $('#gal');
    const toggle = () => {
      const o = gal.classList.toggle('open');
      $$('#moreBtn,#moreBtn2').forEach(b => { b.textContent = o ? 'Show fewer results' : 'Show all results'; b.setAttribute('aria-expanded', o); });
      if (!o) go('#results');
    };
    $('#moreBtn').addEventListener('click', toggle); $('#moreBtn2').addEventListener('click', toggle);
    /* awards carousel */
    $$('[data-aw]').forEach(b => b.addEventListener('click', () => $('#awRow').scrollBy({ left: +b.dataset.aw * 212, behavior: 'auto' })));
    /* FAQ */
    $$('.qa button').forEach(b => b.addEventListener('click', () => {
      const q = b.parentElement, o = q.classList.toggle('open'); b.setAttribute('aria-expanded', o);
    }));
    /* video modal (YouTube loaded only on click) */
    const modal = $('#modal'), mv = $('#mVid');
    const close = () => { modal.classList.remove('open'); setTimeout(() => mv.innerHTML = '', 300); };
    $$('[data-video]').forEach(b => b.addEventListener('click', () => {
      $('#mTitle').textContent = b.dataset.title;
      mv.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0&playsinline=1" title="${b.dataset.title.replace(/"/g, '&quot;')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      modal.classList.add('open'); $('#mClose').focus();
    }));
    $('#mClose').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
    /* consult form → WhatsApp */
    $$('.chips button').forEach(c => c.addEventListener('click', () => c.classList.toggle('on')));
    $('#ask').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, areas = $$('.chips .on').map(c => c.textContent);
      const lines = ['Hi FUE Malaysia, I would like a free consultation for an FUE hair transplant.'];
      if (f.name.value) lines.push('Name: ' + f.name.value);
      if (f.phone.value) lines.push('Phone: ' + f.phone.value);
      if (f.email.value) lines.push('Email: ' + f.email.value);
      if (areas.length) lines.push('Area: ' + areas.join(', '));
      if (f.message.value) lines.push(f.message.value);
      window.open('https://wa.me/60125588572?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

})();
