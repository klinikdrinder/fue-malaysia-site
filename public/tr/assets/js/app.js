/* Tanam Rambut FUE Malaysia — tiny runtime (~5 KB). Lenis smooth scroll (1s, fast), reveals, hero cloud, tilt, slider, WhatsApp form. */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, hover = matchMedia('(hover:hover)').matches;
  var lerp = function (a, b, t) { return a + (b - a) * t; }, clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* smooth scroll: fast, light, no start delay (ease-out starts at full speed) */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) scrollTo(0, 0);
  var quart = function (t) { return 1 - Math.pow(1 - t, 4); };
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: .42, easing: quart, smoothWheel: true, syncTouch: false, wheelMultiplier: 1.9, touchMultiplier: 2.2 });
  }

  window.__lenis = lenis;
  var nav = $('#nav'), hero = $('.rh') || $('.hero'), last = 0, hp = 0;
  var mq = matchMedia('(max-width:980px)');
  var heroH = hero ? hero.offsetHeight : 0, lastHp = -1, oy = -1;
  addEventListener('resize', function () { if (hero) heroH = hero.offsetHeight; }, { passive: true });
  addEventListener('load', function () { if (hero) heroH = hero.offsetHeight; });
  function onScroll(y) {
    if (y === oy) return; oy = y;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hide', y > last && y > innerHeight * 1.1 && !d.body.classList.contains('menu-open'));
    }
    last = y;
    if (hero) hp = clamp(y / Math.max(heroH, 1), 0, 1);
  }

  /* one rAF loop: Lenis + hero scroll var + pointer parallax + page-stack tilt */
  var heroOn = true, mx = 0, my = 0, sx = 0, sy = 0, cards = $$('.cloud .c'), stack = $('.pstack'), cloud = $('.cloud');
  addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  function frame(t) {
    requestAnimationFrame(frame);
    if (d.hidden) return;
    if (lenis) lenis.raf(t);
    onScroll(lenis ? lenis.scroll : scrollY);
    var moving = Math.abs(mx - sx) > .0008 || Math.abs(my - sy) > .0008;
    if (moving) { sx = lerp(sx, mx, .06); sy = lerp(sy, my, .06); }
    if (hero && hp !== lastHp) { lastHp = hp; hero.style.setProperty('--hp', hp.toFixed(3)); }
    if (hero && cloud) {
      if (moving && hover && !reduced && heroOn) {
        for (var i = 0; i < cards.length; i++) { var k = 8 + (i % 3) * 5; cards[i].style.transform = 'translate3d(' + (sx * k).toFixed(1) + 'px,' + (sy * k * .7).toFixed(1) + 'px,0)'; }
      }
    }
    if (stack && moving && hover && !reduced) { stack.style.transform = 'perspective(1400px) rotateY(' + (sx * 10).toFixed(2) + 'deg) rotateX(' + (-sy * 7).toFixed(2) + 'deg)'; }
  }
  requestAnimationFrame(frame);

  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; hero.classList.toggle('off', !heroOn); }).observe(hero);

  /* menu */
  var burger = $('#burger'), mm = $('#mmenu');
  function setMenu(open) {
    d.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); mm.setAttribute('aria-hidden', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  if (burger) { burger.addEventListener('click', function () { setMenu(!d.body.classList.contains('menu-open')); }); $$('a', mm).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); }); }
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); $$('.lang[open]').forEach(function (l) { l.open = false; }); } });
  d.addEventListener('click', function (e) { $$('.lang[open]').forEach(function (l) { if (!l.contains(e.target)) l.open = false; }); });

  /* links: same page -> straight back to the top (or to the section); other pages load at the top */
  function hardTop() {                      /* every scroller we might be inside, including a parent frame */
    try { scrollTo(0, 0); } catch (x) {}
    try { d.documentElement.scrollTop = 0; if (d.body) d.body.scrollTop = 0; } catch (x) {}
    try { if (d.scrollingElement) d.scrollingElement.scrollTop = 0; } catch (x) {}
    try { d.documentElement.scrollIntoView({ block: 'start', inline: 'nearest' }); } catch (x) { }
  }
  function goTo(y, el) {
    if (el) {
      if (lenis) lenis.scrollTo(el, { offset: -70, duration: .5, easing: quart, force: true });
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (lenis) lenis.scrollTo(0, { duration: .5, easing: quart, force: true, onComplete: hardTop });
    else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(function () { if ((lenis ? lenis.scroll : pageYOffset) > 2) { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); hardTop(); } }, 620);
    hardTop();                               /* the parent frame, if there is one, moves at once */
  }
  addEventListener('message', function (e) { if (e.data === 'tr-top') goTo(0); });
  try { if (parent !== window) parent.postMessage({ tr: location.pathname }, '*'); } catch (x) {}
  /* a fresh page always starts at the very top, whatever the browser remembered */
  if (!location.hash) { addEventListener('load', hardTop); setTimeout(hardTop, 0); setTimeout(hardTop, 220); }
  var norm = function (p) { return p.replace(/index\.html$/, '').replace(/\/+$/, ''); };
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== '_self')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || norm(u.pathname) !== norm(location.pathname)) return;
    var el = u.hash.length > 1 ? d.getElementById(decodeURIComponent(u.hash.slice(1))) : null;
    if (u.hash.length > 1 && !el) return;
    e.preventDefault();
    if (el) { goTo(0, el); history.replaceState(null, '', u.hash); } else { goTo(0); }
  });

  /* one swipe: hero -> next section in ~1s (and back) */
  if (lenis && hero && !reduced && hero.offsetHeight <= innerHeight * 1.15) {
    var snapping = false, nextEl = hero.nextElementSibling;
    addEventListener('wheel', function (e) {
      if (snapping || !nextEl || e.ctrlKey || Math.abs(e.deltaY) < 8) return;
      var y = lenis.scroll, h = hero.offsetHeight, to = null;
      if (e.deltaY > 0 && y < h * .6) to = h;
      else if (e.deltaY < 0 && y > 4 && y < h * 1.0 + 40 && y <= h + 40) to = 0;
      if (to === null) return;
      e.preventDefault(); e.stopImmediatePropagation(); snapping = true;
      lenis.scrollTo(to, { duration: .55, easing: quart, force: true, onComplete: function () { snapping = false; } });
    }, { passive: false, capture: true });
  }

  /* reveals — content is visible without JS; motion only adds to it */
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  /* before / after slider */
  $$('.ba').forEach(function (box) {
    var af = $('.af', box), hd = $('.hd', box), pos = 50, down = false;
    function set(v) { pos = clamp(v, 0, 100); af.style.clipPath = 'inset(0 0 0 ' + pos + '%)'; hd.style.left = pos + '%'; box.setAttribute('aria-valuenow', Math.round(pos)); }
    function ev(e) { var r = box.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    box.addEventListener('pointerdown', function (e) { down = true; box.setPointerCapture(e.pointerId); ev(e); });
    box.addEventListener('pointermove', function (e) { if (down) ev(e); });
    box.addEventListener('pointerup', function () { down = false; });
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } });
    set(50);
  });

  /* forms: no backend — confirm on page and hand the details to WhatsApp */
  $$('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var lines = [f.dataset.intro || ''];
      $$('input,select,textarea', f).forEach(function (el) { if (el.value && el.type !== 'hidden') lines.push((el.dataset.l || el.name) + ': ' + el.value); });
      var ok = $('.ok', f); if (ok) ok.classList.add('on');
      open('https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  });

  /* hero: slow, scroll-led reveal. Words rise first, then each picture arrives on its own
     (one after another), while the whole stage drifts with a light sense of depth. */
  (function () {
    var hero = $('.rh'); if (!hero) return;
    var stage = $('.rh-stage', hero), intro = $('.rh-in', hero), items = $$('.rh-i', hero);
    var reveal = $$('.rh .t, .rh .tw'), cells = $$('.rh-i', hero);
    if (reduced || !('IntersectionObserver' in window)) { reveal.concat($$('.rh [data-r]')).forEach(function (e) { e.classList.add('in'); }); return; }

    var lastAt = 0;
    var io = new IntersectionObserver(function (es) {
      var hit = es.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; })
        .sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
      var now = performance.now(), n = 0;
      hit.forEach(function (el) {
        var pic = el.classList.contains('rh-i') ? $('[data-r]', el) : null;
        if (pic) {
          /* pictures that arrive together are spaced apart; a picture right after another waits a beat */
          var wait = 0;
          pic.style.setProperty('--sd', (wait + n * .07).toFixed(2) + 's');
          n++; lastAt = now;
        }
        (pic || el).classList.add('in'); io.unobserve(el);
      });
    }, { threshold: 0, rootMargin: '0px 0px 18% 0px' });
    /* watch each cell (not the picture itself, whose clip-path would hide it from the observer) */
    reveal.concat(cells).forEach(function (el) { io.observe(el); });

    /* depth: each cell eases a little against the scroll, tied to where it sits in the viewport */
    var geo = [], stageTop = 0, ly = -1, lw = -1, onScreen = true;
    function measure() {
      stageTop = stage.getBoundingClientRect().top + (lenis ? lenis.scroll : scrollY);
      geo = items.map(function (el) { return el.offsetTop + el.offsetHeight / 2; });
      ly = -1;
    }
    measure();
    addEventListener('resize', measure, { passive: true });
    addEventListener('load', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(stage);
    new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; }, { rootMargin: '200px 0px' }).observe(hero);

    function tick() {
      requestAnimationFrame(tick);
      if (d.hidden || !onScreen) return;
      var y = lenis ? lenis.scroll : scrollY;
      if (y === ly && innerWidth === lw) return;
      ly = y; lw = innerWidth;
      var vh = innerHeight, mid = y + vh / 2;
      for (var i = 0; i < items.length; i++) {
        var p = clamp((stageTop + geo[i] - mid) / vh, -1, 1);
        items[i].style.setProperty('--p', p.toFixed(3));
      }
      if (intro) intro.style.setProperty('--ip', clamp((y - vh * .08) / (vh * .8), 0, 1).toFixed(3));
    }
    requestAnimationFrame(tick);
  })();


  /* scroll-led motion in the spirit of hobro.digital, on every page:
     · big headings: each line glides in sideways as you scroll (away from the nearest edge, so it never crosses a neighbour)
     · intro paragraphs: words light up one after another as you scroll
     · numbers count up when they arrive
     · sliding rows (Norwood, instruments) drift in from the right */
  (function () {
    if (reduced) return;
    var HEAD = 'main h2.h-l, main h2.h-m, footer .big';
    var heads = $$(HEAD).filter(function (h) { return !h.closest('.rh, .fc, .lb, .pz') && h.textContent.trim().length > 3; });
    var ledes = $$('main .lede, main .rr-close').filter(function (p) { return !p.closest('.rh, .fc, .pz') && p.textContent.trim().length > 50; });
    var rails = $$('main .nrail, main .rail');

    /* wrap every word in a span, keeping inline styling such as the italic turquoise words */
    function wrapWords(el, cls) {
      var out = [];
      (function walk(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var parts = n.textContent.split(/(\s+)/), frag = d.createDocumentFragment();
            parts.forEach(function (t) {
              if (!t) return;
              if (/^\s+$/.test(t)) { frag.appendChild(d.createTextNode(t)); return; }
              var s = d.createElement('span'); s.className = cls; s.textContent = t; frag.appendChild(s); out.push(s);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'SVG') walk(n);
        });
      })(el);
      return out;
    }

    var H = heads.map(function (h) {
      h.classList.remove('rv'); h.classList.add('hx'); h.style.opacity = '1';
      return { el: h, words: wrapWords(h, 'hw'), lines: [], dir: [], D: 0 };
    });
    var L = ledes.map(function (p) {
      p.classList.remove('rv'); p.classList.add('lx'); p.style.opacity = '1';
      return { el: p, words: wrapWords(p, 'lw') };
    });
    rails.forEach(function (r) { r.classList.add('rx'); });

    /* group words into lines and pick a direction for each line */
    function measure(h) {
      var vw = innerWidth, tops = [], idx = [];
      h.words.forEach(function (w) { w.style.transform = ''; });
      h.words.forEach(function (w) {
        var t = Math.round(w.offsetTop), k = tops.indexOf(t);
        if (k < 0) { tops.push(t); k = tops.length - 1; }
        idx.push(k);
      });
      h.lines = idx; h.M = tops.length - 1;
      var r = h.el.getBoundingClientRect(), cx = (r.left + r.right) / 2;
      var centred = getComputedStyle(h.el).textAlign === 'center' || (r.left < vw * .2 && r.right > vw * .8);
      h.dir = tops.map(function (_, i) {
        if (centred) return i % 2 ? 1 : -1;
        return cx < vw / 2 ? -1 : 1;              /* left column glides in from the left, right column from the right */
      });
      h.D = Math.min(vw * .32, 420);
      h.dirty = false;
    }
    /* headings are measured only as they come near the screen, so loading the page does no work for the ones below */
    function layout() {
      H.forEach(function (h) { if (!h.dirty && h.lines.length) h.words.forEach(function (w) { w.style.transform = ''; }); h.dirty = true; });
      ly = -1;
    }
    var ease = function (p) { return 1 - Math.pow(1 - p, 3); };
    var ly = -1, lw = 0;
    function frame() {
      requestAnimationFrame(frame);
      if (d.hidden) return;
      var y = lenis ? lenis.scroll : scrollY;
      if (innerWidth !== lw) { lw = innerWidth; layout(); }
      if (y === ly) return; ly = y;
      var vh = innerHeight;
      var maxY = Math.max(0, d.documentElement.scrollHeight - vh);
      var R = H.map(function (h) { return h.el.getBoundingClientRect(); });   /* read every position first, then move words */
      var RL = L.map(function (o) { return o.el.getBoundingClientRect(); }), RR = rails.map(function (rl) { return rl.getBoundingClientRect(); });
      H.forEach(function (h, hi) {
        var r = R[hi];
        if (r.bottom < -200 || r.top > vh + 200) return;
        if (h.dirty) measure(h);
        var reach = vh - (r.top - (maxY - (window.pageYOffset || 0)));   /* how high it can come before the page ends */
        var span = Math.max(60, Math.min(vh * .5, reach - 1));
        var p = ease(clamp((vh - r.top) / span, 0, 1));   /* near the end of the page the glide finishes on the last scroll */
        for (var i = 0; i < h.words.length; i++) {
          var li = h.lines[i], k = 1 - clamp(p * (1.15 + h.M * .08) - li * .08, 0, 1);   /* every line, the last included, lands exactly in place */
          h.words[i].style.transform = k > 0.001 ? 'translate3d(' + (h.dir[li] * h.D * k).toFixed(1) + 'px,0,0)' : '';
        }
      });
      L.forEach(function (o, oi) {
        var r = RL[oi];
        if (r.bottom < -200 || r.top > vh + 200) return;
        var p = clamp((vh * .92 - r.top) / (vh * .42), 0, 1), n = o.words.length;
        for (var i = 0; i < n; i++) {
          var a = clamp(p * (n + 6) - i, 0, 6) / 6;
          o.words[i].style.opacity = (.2 + .8 * a).toFixed(3);
        }
      });
      rails.forEach(function (rl, ri) {
        var r = RR[ri];
        if (r.bottom < -200 || r.top > vh + 200) return;
        var p = ease(clamp((vh - r.top) / (vh * .6), 0, 1));
        rl.style.transform = p < .999 ? 'translate3d(' + ((1 - p) * Math.min(innerWidth * .3, 380)).toFixed(1) + 'px,0,0)' : '';
      });
    }
    addEventListener('load', layout);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(layout);
    layout(); requestAnimationFrame(frame);

    /* numbers count up when they come into view (10,000+ · 2 juta · 10+) */
    var nums = $$('main .rn-c b, main .stat b').filter(function (b) { return /\d/.test(b.textContent); });
    if (nums.length && 'IntersectionObserver' in window) {
      var nio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return; nio.unobserve(e.target);
          var b = e.target, txt = b.textContent, m = txt.match(/[\d,]+/); if (!m) return;
          var target = +m[0].replace(/,/g, ''), comma = m[0].indexOf(',') > -1, t0 = performance.now(), dur = 1300;
          b.setAttribute('aria-label', txt);
          var step = function (now) {
            var q = Math.min(1, (now - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - q, 3)));
            b.textContent = txt.replace(m[0], comma ? v.toLocaleString('en-US') : String(v));
            if (q < 1) requestAnimationFrame(step); else b.textContent = txt;
          };
          requestAnimationFrame(step);
        });
      }, { threshold: .4 });
      nums.forEach(function (b) { nio.observe(b); });
    }
  })();

  /* motion system (every page): slow 3D scroll reveals, gentle float, cursor / touch tilt, tap to zoom */
  (function () {
    var FR = '.fc,.fb,.fs';
    var TL = FR + ',.rn-c,.rg-3>article,.rp-o>li,.rz-it,.rs-c,.ra-g>li,.an,.svc>li,.stat,.ben>div,.ci>li,.ctab,.rcta';
    var ZM = 'main .fc img,main .fb img,main .fs img';
    var map = new Map(), list = [];
    function get(el) {
      var it = map.get(el);
      if (!it) {
        it = { el: el, rv: false, fl: false, tl: false, e: 1, t0: 0, rx: 0, ry: 0, mx: 0, my: 0, trx: 0, tr: 0, tmx: 0, tmy: 0,
          ph: Math.random() * 6.283, sp: .5 + Math.random() * .3, on: false, last: '' };
        map.set(el, it); list.push(it);
      }
      return it;
    }
    $$('.rv').forEach(function (el) { if (!el.closest('.rh')) { var it = get(el); it.rv = true; it.e = 0; } });
    $$(TL).forEach(function (el) { if (!el.closest('header,footer')) get(el).tl = true; });
    if (hover) $$(FR).forEach(function (el) { get(el).fl = true; });   /* gentle idle float only where there is a mouse */

    var calm = reduced || !('IntersectionObserver' in window);
    if (calm) list.forEach(function (it) { if (it.rv) { it.e = 1; it.el.style.opacity = '1'; } });
    else {
      /* reveal: slow rise out of a slight backward tilt, one after another when several arrive together */
      var rio = new IntersectionObserver(function (es) {
        var now = performance.now(), n = 0;
        es.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; })
          .sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; })
          .forEach(function (el) { var it = map.get(el); it.t0 = now + n * 40; n++; rio.unobserve(el); });
      }, { threshold: 0, rootMargin: '0px 0px 18% 0px' });
      var vio = new IntersectionObserver(function (es) { es.forEach(function (e) { map.get(e.target).on = e.isIntersecting; }); }, { rootMargin: '140px 0px' });
      list.forEach(function (it) { if (it.rv) rio.observe(it.el); vio.observe(it.el); });

      var DUR = 800, ease = function (p) { return 1 - Math.pow(1 - p, 3); };
      var loop = function (now) {
        requestAnimationFrame(loop);
        if (d.hidden) return;
        var t = now / 1000;
        for (var i = 0; i < list.length; i++) {
          var it = list[i];
          if (it.rv && it.e < 1) {
            if (!it.t0 || now < it.t0) continue;
            it.e = ease(Math.min(1, (now - it.t0) / DUR));
          }
          var settling = Math.abs(it.trx - it.rx) + Math.abs(it.tr - it.ry) + Math.abs(it.tmx - it.mx) + Math.abs(it.tmy - it.my) > .02;
          if (!it.on && !settling && it.e >= 1) continue;
          it.rx += (it.trx - it.rx) * .07; it.ry += (it.tr - it.ry) * .07;
          it.mx += (it.tmx - it.mx) * .07; it.my += (it.tmy - it.my) * .07;
          var q = 1 - it.e, fy = 0, fr = 0;
          if (it.fl) { fy = Math.sin(t * it.sp + it.ph) * 3; fr = Math.sin(t * it.sp * .8 + it.ph * 1.7) * .35; }
          var s = 'perspective(1100px) translate3d(' + it.mx.toFixed(2) + 'px,' + (q * 26 + fy + it.my).toFixed(2) + 'px,0) rotateX(' + (q * 7 + it.rx).toFixed(3) + 'deg) rotateY(' + it.ry.toFixed(3) + 'deg)' + (fr ? ' rotate(' + fr.toFixed(3) + 'deg)' : '');
          if (s !== it.last) { it.el.style.transform = s; it.last = s; }
          if (it.rv) it.el.style.opacity = q > 0 ? Math.min(1, it.e * 1.3).toFixed(3) : '1';
        }
      };
      requestAnimationFrame(loop);

      /* tilt toward the cursor or finger; wide blocks tilt less so nothing reaches its neighbour */
      var hov = null;
      var aim = function (it, x, y) {
        var r = it.el.getBoundingClientRect(); if (!r.width) return;
        var px = clamp((x - r.left) / r.width, 0, 1) - .5, py = clamp((y - r.top) / r.height, 0, 1) - .5;
        var m = Math.min(7, Math.max(1.4, 1500 / r.width)), sh = it.fl ? 4 : 2;
        it.tr = px * 2 * m; it.trx = -py * 2 * m * .8; it.tmx = px * sh * 2; it.tmy = py * sh * 2;
        it.el.style.setProperty('--mx', ((px + .5) * 100).toFixed(1) + '%');
        it.el.style.setProperty('--my', ((py + .5) * 100).toFixed(1) + '%');
      };
      var release = function (it) { it.trx = it.tr = it.tmx = it.tmy = 0; it.el.classList.remove('is-tilt'); };
      var track = function (e) {
        var el = e.target.closest && e.target.closest(TL), it = el && map.get(el);
        if (hov && hov !== it) { release(hov); hov = null; }
        if (it && it.tl) { hov = it; it.el.classList.add('is-tilt'); aim(it, e.clientX, e.clientY); }
      };
      d.addEventListener('pointermove', track, { passive: true });
      d.addEventListener('pointerdown', track, { passive: true });
      var up = function (e) { if (e.pointerType !== 'mouse' && hov) { var h = hov; hov = null; setTimeout(function () { release(h); }, 420); } };
      addEventListener('pointerup', up, { passive: true });
      addEventListener('pointercancel', up, { passive: true });
      d.documentElement.addEventListener('pointerleave', function () { if (hov) { release(hov); hov = null; } });
      addEventListener('blur', function () { if (hov) { release(hov); hov = null; } });
    }

    /* page changes feel instant: fetch the other pages and their pictures quietly in the background */
    var warm = function () {
      var cn = navigator.connection; if (cn && (cn.saveData || /2g/.test(cn.effectiveType || ''))) return;
      var seen = {};
      $$('a[href]').forEach(function (a) {
        var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
        if (u.origin !== location.origin || !/index\.html$|\/$/.test(u.pathname) || u.pathname === location.pathname || seen[u.pathname]) return;
        seen[u.pathname] = 1;
        var l = d.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname; d.head.appendChild(l);
      });
    };
    if (d.readyState === 'complete') setTimeout(warm, 600); else addEventListener('load', function () { setTimeout(warm, 600); });

    /* drag rails (Norwood scale): drag with the mouse, swipe on touch, arrows and a progress line */
    $$('.nrail').forEach(function (rail) {
      var down = false, sx = 0, sl = 0;
      rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; rail.dataset.moved = ''; sx = e.clientX; sl = rail.scrollLeft; });
      addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { rail.dataset.moved = '1'; rail.classList.add('dragging'); } rail.scrollLeft = sl - dx; });
      addEventListener('pointerup', function () { if (!down) return; down = false; rail.classList.remove('dragging'); setTimeout(function () { rail.dataset.moved = ''; }, 0); });
      rail.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }, { passive: true });
      var wrap = rail.parentElement, prog = $('.rail-progress i', wrap);
      var sync = function () { if (prog) prog.style.transform = 'scaleX(' + (rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth)).toFixed(3) + ')'; };
      rail.addEventListener('scroll', sync, { passive: true }); sync();
      $$('[data-rail-step]', wrap).forEach(function (b) { b.addEventListener('click', function () { rail.scrollBy({ left: +b.dataset.railStep * rail.clientWidth * .8, behavior: 'smooth' }); }); });
    });

    /* zoom: click or tap any picture to see it larger; arrows step through the pictures of that section */
    var lb = d.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Paparan gambar');
    lb.innerHTML = '<button class="lb-x" type="button" aria-label="Tutup">×</button><button class="lb-p" type="button" aria-label="Gambar sebelumnya">←</button><button class="lb-n" type="button" aria-label="Gambar seterusnya">→</button><figure><img alt=""><figcaption></figcaption><a class="go" hidden>Buka halaman →</a></figure>';
    d.body.appendChild(lb);
    var lim = $('img', lb), cap = $('figcaption', lb), go = $('.go', lb), bx = $('.lb-x', lb), bp = $('.lb-p', lb), bn = $('.lb-n', lb);
    var group = [], idx = 0, back = null;
    function label(img) {
      var c = img.closest('.fc'), h = c && $('h3,h2,figcaption', c);
      return (h && h.textContent.trim()) || img.alt || '';
    }
    function show() {
      var s = group[idx];
      lim.classList.remove('in');
      lim.onload = function () { requestAnimationFrame(function () { lim.classList.add('in'); }); };
      lim.src = s.currentSrc || s.src; lim.alt = s.alt || '';
      if (lim.complete) lim.onload();
      cap.textContent = label(s);
      var a = s.closest('a[href]');
      if (a) { go.href = a.href; go.hidden = false; if (a.target) go.target = a.target; else go.removeAttribute('target'); } else go.hidden = true;
      bp.hidden = bn.hidden = group.length < 2;
    }
    function open(img) {
      var sec = img.closest('section') || img.closest('main');
      group = $$(ZM).filter(function (g) { return sec.contains(g) && g.offsetParent !== null; });
      idx = Math.max(0, group.indexOf(img)); back = d.activeElement;
      show(); lb.classList.add('on'); d.documentElement.classList.add('lb-open');
      if (lenis) lenis.stop();
      bx.focus({ preventScroll: true });
    }
    function close() {
      if (!lb.classList.contains('on')) return;
      lb.classList.remove('on'); lim.classList.remove('in'); d.documentElement.classList.remove('lb-open');
      if (lenis) lenis.start();
      if (back && back.focus) back.focus({ preventScroll: true });
    }
    function step(k) { if (group.length < 2) return; idx = (idx + k + group.length) % group.length; show(); }
    d.addEventListener('click', function (e) {
      var img = e.target.closest && e.target.closest('img');
      if (!img || !img.matches(ZM)) return;
      var rl = img.closest('.nrail'); if (rl && rl.dataset.moved === '1') { e.preventDefault(); e.stopPropagation(); return; }
      e.preventDefault(); e.stopPropagation(); open(img);
    }, true);
    lb.addEventListener('click', function (e) {
      if (e.target === bp) { step(-1); return; }
      if (e.target === bn) { step(1); return; }
      if (e.target === go) return;
      close();
    });
    addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') { var f = [bx, bp, bn, go].filter(function (b) { return !b.hidden; }), i = f.indexOf(d.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    });
  
    /* Google Ads / Analytics: count enquiries (WhatsApp, phone, booking) as conversion events.
       Works with whatever tag is pasted into the head later (gtag.js or Google Tag Manager). */
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var h = a.getAttribute('href') || '', kind = /wa\.me|whatsapp/i.test(h) ? 'whatsapp' : /^tel:/i.test(h) ? 'phone' : /#form$/.test(h) ? 'booking' : /google\.com\/maps/.test(h) ? 'directions' : '';
      if (!kind) return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'lead_click', lead_method: kind, page_path: location.pathname });
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: kind });
    }, true);
    $$('form[data-wa]').forEach(function (f) { f.addEventListener('submit', function () {
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'lead_form', lead_method: 'form', page_path: location.pathname });
      if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form' });
    }); });
  })();

  /* pictures: the first screen loads as normal (keeps Google's speed scores), then, once the page has finished
     loading, every other picture on the page is fetched top to bottom, so each one is already there when you reach it */
  (function () {
    var imgs = $$('img[loading="lazy"]'); if (!imgs.length) return;
    var c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ''))) return;
    function go() {
      var i = 0;
      (function next() {
        var batch = imgs.slice(i, i + 4); i += 4; if (!batch.length) return;
        var left = batch.length, done = function () { if (--left === 0) setTimeout(next, 0); };
        batch.forEach(function (im) {
          if (im.complete && im.naturalWidth) { done(); return; }
          im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true });
          im.loading = 'eager';
        });
      })();
    }
    function start() { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(go, { timeout: 1500 }); }
    if (d.readyState === 'complete') start(); else addEventListener('load', start);
  })();


  /* galleries: every picture in a row as tall as the cards beside it (pictures stay whole, never cropped) */
  (function () {
    var stages = $$('.rh-stage'); if (!stages.length) return;
    function eq() {
      stages.forEach(function (s) {
        var its = [].slice.call(s.children).filter(function (e) { return e.classList.contains('rh-i'); }), rows = {};
        its.forEach(function (i) { var im = !i.querySelector('.fc') && i.querySelector('figure img'); if (im) im.style.removeProperty('--h'); });
        its.forEach(function (i) { var t = i.offsetTop; (rows[t] = rows[t] || []).push(i); });
        Object.keys(rows).forEach(function (k) {
          var r = rows[k], h = 0;
          r.forEach(function (i) { if (i.querySelector('.fc')) h = Math.max(h, i.offsetHeight); });
          if (!h) return;
          r.forEach(function (i) {
            if (i.querySelector('.fc')) return;
            var im = i.querySelector('figure img'); if (!im) return;
            var extra = im.closest('figure').offsetHeight - im.offsetHeight;
            im.style.setProperty('--h', Math.max(120, h - extra) + 'px');
          });
        });
      });
    }
    eq(); addEventListener('load', eq);
    addEventListener('resize', function () { clearTimeout(eq.t); eq.t = setTimeout(eq, 150); });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(eq);
  })();
  /* enquiry form: after the details go to WhatsApp, the visitor lands on the thank-you page. The page gets a ready
     WhatsApp button with the same message (in case WhatsApp did not open) and greets them by name. */
  $$('form[data-thanks]').forEach(function (f) {
    f.addEventListener('submit', function () {
      var lines = [f.dataset.intro || ''], name = '', rows = [];
      $$('input,select,textarea', f).forEach(function (el) {
        if (el.value && el.type !== 'hidden') { lines.push((el.dataset.l || el.name) + ': ' + el.value); rows.push([(el.dataset.l || el.name).replace(/\s*\(pilihan\)$/, ''), el.value.trim().slice(0, 300)]); }
        if (el.name === 'name') name = el.value.trim();
      });
      try { sessionStorage.setItem('trLead', JSON.stringify({ n: name, r: rows, u: 'https://wa.me/' + f.dataset.wa + '?text=' + encodeURIComponent(lines.join('\n')) })); } catch (x) {}
      setTimeout(function () { location.href = f.dataset.thanks; }, 300);
    });
  });
  (function () {
    var wa = $('.tk-wa'); if (!wa) return;
    var lead = null; try { lead = JSON.parse(sessionStorage.getItem('trLead') || 'null'); } catch (x) {}
    if (!lead) return;
    if (lead.u) wa.href = lead.u;
    var lede = $('.rh-sub');
    if (lead.n && lede) lede.insertBefore(d.createTextNode('Terima kasih, ' + lead.n.slice(0, 40) + '. '), lede.firstChild);
    var sum = $('.tk-sum'), dl = sum && $('dl', sum);                  /* each person sees their own details */
    if (dl && lead.r && lead.r.length) {
      lead.r.forEach(function (r) { var dt = d.createElement('dt'), dd = d.createElement('dd'); dt.textContent = r[0]; dd.textContent = r[1]; dl.appendChild(dt); dl.appendChild(dd); });
      sum.hidden = false;
    }
    if (!lead.c) {                                   /* count the enquiry once: Google Ads / Analytics thank-you conversion */
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'thank_you_page', lead_method: 'form', page_path: location.pathname });
      lead.c = 1; try { sessionStorage.setItem('trLead', JSON.stringify(lead)); } catch (x) {}
    }
  })();

  /* hero headline: letters rise one after another, like a title being set */
  (function () {
    if (reduced) return;
    $$('.rh-h .w>span').forEach(function (sp) {
      if (sp.querySelector('.ch')) return;            /* already split when the site was built */
      var ch = sp.textContent, c0 = +(sp.parentNode.style.getPropertyValue('--w') || 0);
      sp.setAttribute('aria-hidden', 'true');
      sp.textContent = '';
      for (var i = 0; i < ch.length; i++) { var s = d.createElement('span'); s.className = 'ch'; s.textContent = ch[i]; s.style.setProperty('--c', String(c0 * 4 + i)); sp.appendChild(s); }
    });
    $$('.rh-h').forEach(function (h) { if (!h.getAttribute('aria-label')) h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim()); h.classList.add('lt'); });
    /* big section headings: the letters of each word rise as the line glides in */
    var hs = $$('main .hx');
    hs.forEach(function (h) {
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
      $$('.hw', h).forEach(function (w, wi) {
        var t = w.textContent; w.textContent = ''; w.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < t.length; i++) { var s = d.createElement('span'); s.className = 'ch'; s.textContent = t[i]; s.style.setProperty('--c', String(wi * 3 + i)); w.appendChild(s); }
      });
      h.classList.add('lt');
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lt-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px 10% 0px' });
      hs.forEach(function (h) { io.observe(h); });
    } else hs.forEach(function (h) { h.classList.add('lt-in'); });
  })();

  /* home opening: a faceless head with hair, made of thousands of small particles on a fixed layer.
     It flows constantly, scatters where the cursor or finger touches and gathers again, turns toward
     the cursor, crosses from right to left, breaks apart in the middle, regathers, and fades out.
     The background melts from near-black to cream on the way. Text lines rise out of masks. */

  /* shared: one download of the 3D library for the whole page, started as early as the device needs it */
  window.__three = window.__three || function (cb) {
    if (window.THREE) return cb();
    var q = window.__threeQ = window.__threeQ || []; q.push(cb); if (q.length > 1) return;
    var s = d.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.async = true;
    s.onload = function () { q.splice(0).forEach(function (f) { f(); }); }; d.head.appendChild(s);
  };
  var TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
  /* devices with no graphics chip (software-only 3D drawing, as on speed-test machines): a lighter particle mode,
     fewer particles drawn at a gentler rate, so the page stays responsive. Any phone, tablet or computer with a
     graphics chip keeps the full effect. */
  /* one quick check of the device's 3D drawing, shared by the opening and the background particles */
  window.__gl = window.__gl || (function () {
    try {
      var c = d.createElement('canvas'), o = { failIfMajorPerformanceCaveat: true };
      var g = c.getContext('webgl', o) || c.getContext('experimental-webgl', o);
      if (!g) return { ok: true, soft: true };          /* no graphics chip (or no 3D): answered instantly, lighter mode on first interaction */
      var e = g.getExtension('WEBGL_debug_renderer_info'), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      var soft = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(n || ''));
      var lc = g.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
      return { ok: true, soft: soft };
    } catch (x) { return { ok: false }; }
  })();
  /* with a graphics chip: start as planned. Without one (software-only drawing): start on the visitor's first scroll,
     tap, key or mouse move, so loading the page never waits on the slow 3D set-up */
  window.__when3d = window.__when3d || function (f) {
    if (!window.__gl.soft) return f();
    var ev = ['pointerdown', 'pointermove', 'touchstart', 'wheel', 'keydown'], done = false;
    var h = function () { if (done) return; done = true; ev.forEach(function (x) { removeEventListener(x, h, true); }); f(); };
    ev.forEach(function (x) { addEventListener(x, h, { capture: true, passive: true }); });
  };
  window.__softGL = window.__softGL || function (r) {
    try { var g = r.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(n || '')); } catch (x) { return false; }
  };
  /* phones and tablets: size the 3D layer to the tallest screen once, so the address bar sliding away never forces a redraw */
  var tallH = function () { var p = d.createElement('div'); p.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden'; d.body.appendChild(p); var h = p.offsetHeight || innerHeight; p.remove(); return Math.max(h, innerHeight); };
  (function () {
    var pz = $('.pz'); if (!pz) return;
    if (TOUCH) pz.classList.add('fast');
    var WOMAN = pz.dataset.shape === 'woman';
    var TRACED = !!pz.dataset.cloud;   /* both heads are traced from their reference pictures; the shape file loads with the 3D, off the critical path */
    var TURN = TRACED ? .12 : 1;   /* traced heads stay facing as in their picture, so the hair outline reads exactly */
    var cv = $('.pz-cv', pz), secs = $$('.pz-sec', pz), root = d.documentElement;
    var mob = function () { return innerWidth <= 760; };
    var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
    var mix = function (a, b, t) { return a + (b - a) * t; };

    /* hero text shows straight away */
    requestAnimationFrame(function () { $$('.pz .t, .pz .rh-h').forEach(function (e) { e.classList.add('in'); }); });

    /* ---- text: every line sits in a mask and rises as it arrives (and sinks back when you scroll up) ---- */
    var blocks = $$('[data-lines]', pz), LINES = [];
    var TXT = $$('.pz-tx, .pz-big', pz);
    function split() {
      LINES = [];
      blocks.forEach(function (el) {
        if (el.dataset.src == null) { el.dataset.src = el.innerHTML; el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim()); }
        else el.innerHTML = el.dataset.src;
        var words = [];
        (function walk(node, it) {
          [].slice.call(node.childNodes).forEach(function (n) {
            if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(function (t) { if (t) words.push({ t: t, it: it }); });
            else if (n.nodeType === 1) walk(n, it || n.classList.contains('it'));
          });
        })(el, false);
        el.innerHTML = '';
        var spans = words.map(function (w) {
          var s = d.createElement('span'); s.className = 'pw' + (w.it ? ' it' : ''); s.textContent = w.t;
          el.appendChild(s); el.appendChild(d.createTextNode(' ')); return s;
        });
        var lines = [], top = null, cur = null;
        spans.forEach(function (s) { var t = s.offsetTop; if (top === null || Math.abs(t - top) > 3) { top = t; cur = []; lines.push(cur); } cur.push(s); });
        el.innerHTML = '';
        lines.forEach(function (ws, li) {
          var o = d.createElement('span'), i = d.createElement('span');
          o.className = 'pl'; o.setAttribute('aria-hidden', 'true'); i.className = 'pli';
          ws.forEach(function (s, k) { i.appendChild(s); if (k < ws.length - 1) i.appendChild(d.createTextNode(' ')); });
          o.appendChild(i); el.appendChild(o); LINES.push({ o: o, i: i, k: li });
        });
      });
      settle = 4;
    }
    if (!reduced) {
      split();
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(split);
      var rw = innerWidth; addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; split(); } });
    }

    /* ---- scroll story ---- */
    var G = { top: 0, s: [], end: 0 };
    function measure() {
      var y = (window.pageYOffset || d.documentElement.scrollTop || 0);
      G.top = pz.getBoundingClientRect().top + y;
      G.s = secs.map(function (s) { return s.getBoundingClientRect().top + y; });
      G.end = G.top + pz.offsetHeight;
    }
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(pz);

    var S = { x: 1, y: 0, sc: 1, yaw: -.6, morph: 0, dark: 1, alpha: 1 }, C = { x: 1, y: 0, sc: 1, yaw: -.6, morph: 0, dark: 1, alpha: 1 };
    var c1 = [11, 13, 14], c2 = [246, 238, 227], f1 = [246, 238, 227], f2 = [10, 11, 12];
    var rgb = function (a, b, t, al) { return 'rgba(' + Math.round(mix(a[0], b[0], t)) + ',' + Math.round(mix(a[1], b[1], t)) + ',' + Math.round(mix(a[2], b[2], t)) + ',' + (al == null ? 1 : al) + ')'; };
    var lastDark = -1;
    function story(y) {
      var vh = innerHeight, s = G.s, m = mob();
      var R = m ? 0 : 1.3, L = m ? 0 : -1.3;
      var a = smooth(s[1] - vh * .85, s[1] - vh * .05, y);                       /* hero → section 2: right to left */
      var sc1 = smooth(s[2] - vh * .55, s[2] + vh * .25, y);                    /* break apart */
      var sc2 = smooth(s[3] - vh * .95, s[3] - vh * .1, y);                     /* gather again */
      var b = sc2;                                                               /* and land on the right */
      S.morph = Math.max(0, sc1 - sc2);
      S.x = mix(mix(R, L, a), R, b);
      S.yaw = mix(mix(-.62, .62, a), -.62, b) * TURN;
      S.dark = 1 - smooth(s[2] + vh * .15, s[2] + vh * .6, y);
      S.alpha = 1 - smooth(G.end - vh * 1.05, G.end - vh * .35, y);
      S.y = m ? (WOMAN ? .98 : .62) : 0; S.sc = m ? (WOMAN ? .42 : .56) : .9;   /* phones: her long hair sits in the top half, above the text */
      if (m) {                                   /* phones: dim the head while a block of text passes over its half */
        var top = 1e9;
        TXT.forEach(function (t) { var r = t.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) top = Math.min(top, r.top); });
        S.alpha *= 1 - .72 * smooth(vh * .62, vh * .4, top);
      }
    }
    function paint() {
      var t = C.dark;
      if (Math.abs(t - lastDark) > .002) {
        lastDark = t;
        pz.style.setProperty('--pzbg', rgb(c1, c2, 1 - t));
        pz.style.setProperty('--pzfg', rgb(f2, f1, t));
        pz.style.setProperty('--pzmut', rgb(f2, f1, t, .68));
        pz.style.setProperty('--pzit', t > .5 ? '#5FD0CA' : '#14807B');
      }
      var y = (window.pageYOffset || d.documentElement.scrollTop || 0);
      root.classList.toggle('pz-dark', t > .5 && y < G.end - 80);
    }
    function lines() {
      var vh = innerHeight;
      for (var n = 0; n < LINES.length; n++) {
        var L = LINES[n], r = L.o.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        var q = clamp((vh * .97 - r.top) / (vh * .2), 0, 1); q = 1 - Math.pow(1 - q, 3);
        var v = (1 - q) * 112;
        L.i.style.transform = v > .05 ? 'translate3d(0,' + v.toFixed(2) + '%,0)' : '';
      }
    }

    /* ---- the particle head ---- */
    var three = null, ready = false, inView = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(pz);
    var gl = window.__gl.ok;
    var go = function () {
      if (!gl) return;
      var need = 2, ready2 = function () { if (--need === 0) build(); };
      window.__three(ready2);
      if (!TRACED) ready2();
      else { var sc = d.createElement('script'); sc.src = pz.dataset.cloud; sc.async = true; sc.onload = ready2; sc.onerror = function () { TRACED = false; ready2(); }; d.head.appendChild(sc); }
    };
    var go0 = go; go = function () { window.__when3d(go0); };
    if (TOUCH) go();                                   /* phones and tablets: start straight away, no waiting for the page to finish */
    else if (d.readyState === 'complete') setTimeout(go, 30); else addEventListener('load', function () { setTimeout(go, 30); });

    /* the head: an original faceless form (skull, jaw, ears, neck, shoulders) plus hair grown as strands */
    function headCloud(N) {
      var seed = 7; var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      var ell = function (x, y, z, cx, cy, cz, rx, ry, rz) { var a = (x - cx) / rx, b = (y - cy) / ry, c = (z - cz) / rz; return (Math.sqrt(a * a + b * b + c * c) - 1) * Math.min(rx, ry, rz); };
      var smin = function (a, b, k) { var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; };
      var sdf = function (x, y, z) {
        var dd = ell(x, y, z, 0, .3, -.06, .8, .86, .92);
        dd = smin(dd, ell(x, y, z, 0, -.2, .27, .6, .74, .62), .32);
        dd = smin(dd, ell(x, y, z, 0, -.66, .4, .32, .22, .28), .22);
        dd = smin(dd, ell(Math.abs(x), y, z, .77, -.02, -.03, .09, .21, .13), .06);
        var nr = Math.sqrt(x * x + (z + .1) * (z + .1)) - .35, ny = Math.abs(y + 1.15) - .6;
        var neck = Math.min(Math.max(nr, ny), 0) + Math.sqrt(Math.max(nr, 0) * Math.max(nr, 0) + Math.max(ny, 0) * Math.max(ny, 0));
        dd = smin(dd, neck, .24);
        dd = smin(dd, ell(x, y, z, 0, -1.98, -.05, 1.5, .42, .7), .36);
        return dd;
      };
      var HAIR = Math.round(N * .6), SKIN = N - HAIR;
      var head = new Float32Array(N * 3), kind = new Float32Array(N), k = 0;
      var tries = 0;
      while (k < SKIN && tries < 4e6) {
        tries++;
        var x = rnd() * 3.2 - 1.6, y = rnd() * 3.4 - 2.2, z = rnd() * 2.2 - 1.1;
        if (y < -2.18) continue;
        var v = sdf(x, y, z);
        if (Math.abs(v) > .014) continue;
        if (y < -1.45 && rnd() < .45) continue;                      /* lighter on the shoulders */
        head[k * 3] = x; head[k * 3 + 1] = y; head[k * 3 + 2] = z; kind[k] = 0; k++;
      }
      /* hair: roots on the scalp, strands with volume, swept up and back, a fringe falling forward to one side */
      var hairline = function (y, z, x) {
        var yl = z > .5 ? .6 : z > 0 ? .6 - (.5 - z) * .8 : .2 + z * .8;
        if (Math.abs(x) > .58 && z > -.25 && z < .3 && y < .32) return false;   /* keep the ears clear */
        return y > Math.max(yl, -.52);
      };
      while (k < N) {
        var u = rnd() * 2 - 1, ph = rnd() * Math.PI * 2, rr = Math.sqrt(1 - u * u);
        var ux = rr * Math.cos(ph), uy = u, uz = rr * Math.sin(ph);
        var px = ux * .8, py = .3 + uy * .86, pz2 = -.06 + uz * .92;
        if (!hairline(py, pz2, px)) continue;
        var nx = ux / .8, ny2 = uy / .86, nz = uz / .92, nl = Math.sqrt(nx * nx + ny2 * ny2 + nz * nz); nx /= nl; ny2 /= nl; nz /= nl;
        var top = py > .62, front = pz2 > .3;
        var fx, fy, fz;
        if (front && top) { fx = .5; fy = -.1; fz = .55; }              /* fringe: forward and to the side */
        else if (top) { fx = .22; fy = .25; fz = -.75; }                /* crown: swept back with lift */
        else { fx = nx * .2; fy = -.85; fz = -.3; }                      /* sides and back: falls down */
        var L = (top ? .3 : .2) + rnd() * .22, steps = 7 + Math.floor(rnd() * 5), wav = rnd() * 6.28, lift = top ? .5 : .25;
        for (var i = 0; i < steps && k < N; i++) {
          var s = (i + rnd() * .6) / steps;
          var w = Math.sin(s * 8 + wav) * .03 * s;
          head[k * 3] = px + nx * (L * lift * s) + fx * L * s * s + w + (rnd() - .5) * .018;
          head[k * 3 + 1] = py + ny2 * (L * lift * s) + fy * L * s * s + (rnd() - .5) * .018;
          head[k * 3 + 2] = pz2 + nz * (L * lift * s) + fz * L * s * s + w * .6 + (rnd() - .5) * .018;
          kind[k] = 1; k++;
        }
      }
      return { head: head, kind: kind };
    }

    var renderer, scene, cam, pts, mat, U, SOFT = false, lastR = 0;
    var mx = 0, my = 0, mTarget = 0, mS = 0, lastMove = 0, px = 0, py = 0, t0 = 0;
    function build() {
      var T = window.THREE; if (!T) return;
      try { renderer = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: 'high-performance' }); } catch (x) { return; }
      renderer.setPixelRatio(mob() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      scene = new T.Scene(); cam = new T.PerspectiveCamera(35, innerWidth / innerHeight, .1, 50); cam.position.set(0, 0, 6);
      var N = TRACED ? (mob() ? 9000 : 24000) : (mob() ? 4200 : 15000);
      var CLOUD = WOMAN ? window.__womanCloud : window.__manCloud;
      if (!CLOUD) { TRACED = false; N = mob() ? 4200 : 15000; }
      SOFT = window.__softGL(renderer); if (SOFT) N = Math.round(N / 3);
      var H = CLOUD ? CLOUD(N) : headCloud(N);
      var scat = new Float32Array(N * 3), aR = new Float32Array(N * 4), seed = 11;
      var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (var i = 0; i < N; i++) {
        scat[i * 3] = (rnd() * 2 - 1) * 3.6; scat[i * 3 + 1] = (rnd() * 2 - 1) * 2.5; scat[i * 3 + 2] = rnd() * 3.4 - 2.4;
        aR[i * 4] = rnd(); aR[i * 4 + 1] = rnd(); aR[i * 4 + 2] = H.kind[i]; aR[i * 4 + 3] = rnd();
      }
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(H.head, 3));
      g.setAttribute('aScat', new T.BufferAttribute(scat, 3));
      g.setAttribute('aR', new T.BufferAttribute(aR, 4));
      U = { uTime: { value: 0 }, uMorph: { value: 1 }, uSize: { value: (mob() ? 9 : 10.5) * (TRACED ? .55 : 1) }, uPR: { value: renderer.getPixelRatio() },
            uDark: { value: 1 }, uAlpha: { value: 1 }, uMS: { value: 0 }, uMouse: { value: new T.Vector3(9, 9, 0) }, uFlow: { value: reduced ? 0 : 1 } };
      mat = new T.ShaderMaterial({
        uniforms: U, transparent: true, depthWrite: false, depthTest: false,
        vertexShader: [
          'uniform float uTime,uMorph,uSize,uPR,uDark,uAlpha,uMS,uFlow; uniform vec3 uMouse;',
          'attribute vec3 aScat; attribute vec4 aR;',
          'varying float vA; varying vec3 vC; varying float vRot;',
          'vec3 hairD(float r){ if(r<.55) return vec3(.17,.71,.69); if(r<.85) return vec3(.56,.88,.85); return vec3(.965,.933,.89); }',
          'vec3 skinD(float r){ if(r<.6) return vec3(.965,.933,.89); if(r<.85) return vec3(.88,.78,.6); return vec3(.36,.78,.75); }',
          'vec3 hairL(float r){ if(r<.6) return vec3(.04,.045,.05); if(r<.85) return vec3(.08,.5,.48); return vec3(.17,.71,.69); }',
          'vec3 skinL(float r){ if(r<.55) return vec3(.16,.14,.12); if(r<.85) return vec3(.33,.28,.23); return vec3(.08,.5,.48); }',
          'void main(){',
          '  float r=aR.x, r2=aR.y, kind=aR.z;',
          '  float m=clamp(uMorph*1.5-r2*.5,0.,1.); m=m*m*(3.-2.*m);',
          '  vec3 p=mix(position,aScat,m);',
          '  float t=uTime*uFlow, amp=(.01+min(kind,1.)*.012+m*.2)*uFlow;',
          '  p+=vec3(sin(t*.7+position.y*3.1+r*6.28),cos(t*.6+position.x*2.7+r2*6.28),sin(t*.5+position.z*2.9+r*3.))*amp;',
          '  vec4 wp=modelMatrix*vec4(p,1.);',
          '  vec2 dd=wp.xy-uMouse.xy; float dist=length(dd);',
          '  float push=(1.-smoothstep(0.,.5,dist))*uMS;',
          '  wp.xy+=(normalize(dd+vec2(1e-4))*(.22+.45*r)+vec2(r-.5,r2-.5)*.5)*push;',
          '  wp.z+=push*(r2-.35)*.7;',
          '  vec4 mv=viewMatrix*wp; gl_Position=projectionMatrix*mv;',
          '  gl_PointSize=uSize*(.55+aR.w*.9)*(kind>.5?1.:.82)*uPR*(6./-mv.z);',
          '  float depth=clamp(wp.z*.55+.6,0.,1.);',
          '  vec3 nn=normalize(mat3(modelMatrix)*(position-vec3(0.,-.15,-.05)));',
          '  float lit=mix(1.,.3+.7*clamp(dot(nn,normalize(vec3(-.55,.55,.75)))*.8+.35,0.,1.),1.-m);',
          '  vA=uAlpha*(kind>.5?1.:mix(.62,.55,1.-uDark))*mix(.4,1.,depth)*lit*mix(1.,.45,m);',
          '  vC=kind>.5?mix(hairL(r),hairD(r),uDark):mix(skinL(r),skinD(r),uDark);',
          '  vC=mix(vC,mix(vec3(.17,.71,.69),vec3(.965,.933,.89),uDark),clamp(kind-1.,0.,1.)*.25);',
          '  vRot=r2*6.2831+t*(r-.5)*.5;',
          '}'].join('\n'),
        fragmentShader: [
          'varying float vA; varying vec3 vC; varying float vRot;',
          'float sdTri(vec2 p,float r){ const float k=1.7320508; p.x=abs(p.x)-r; p.y=p.y+r/k; if(p.x+k*p.y>0.) p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.; p.x-=clamp(p.x,-2.*r,0.); return -length(p)*sign(p.y); }',
          'void main(){',
          '  vec2 c=gl_PointCoord-.5; float cs=cos(vRot), sn=sin(vRot); c=vec2(c.x*cs-c.y*sn,c.x*sn+c.y*cs);',
          '  float dt=sdTri(c,.27); float a=(1.-smoothstep(.04,.1,abs(dt)))*vA;',
          '  if(a<.01) discard; gl_FragColor=vec4(vC,a);',
          '}'].join('\n')
      });
      pts = new T.Points(g, mat); pts.frustumCulled = false; scene.add(pts);
      three = T;
      var sw = 0, size = function () {
        if (TOUCH && innerWidth === sw) return; sw = innerWidth;
        var H = TOUCH ? tallH() : innerHeight;
        renderer.setSize(innerWidth, H, false); cam.aspect = innerWidth / H; cam.updateProjectionMatrix();
      };
      size(); addEventListener('resize', size);
      if (!reduced) {
        var aim = function (e) { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight * 2 - 1); mTarget = 1; lastMove = performance.now(); };
        addEventListener('pointermove', aim, { passive: true });
        addEventListener('pointerdown', aim, { passive: true });
        addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') setTimeout(function () { mTarget = 0; }, 350); }, { passive: true });
        d.documentElement.addEventListener('pointerleave', function () { mTarget = 0; });
      }
      t0 = performance.now(); ready = true; settle = 4; C.morph = reduced ? 0 : 1;
      pz.classList.add('live');
    }

    /* ---- one loop for everything ---- */
    var ly = -1, settle = 4;
    addEventListener('resize', function () { settle = 4; });
    function frame(now) {
      requestAnimationFrame(frame);
      if (d.hidden) return;
      var y = (window.pageYOffset || d.documentElement.scrollTop || 0);
      var moved = y !== ly; ly = y;
      if (moved || settle > 0) { if (settle > 0) settle--; story(y); if (!reduced) lines(); }
      var k = reduced ? 1 : .075;
      C.x = mix(C.x, S.x, k); C.y = mix(C.y, S.y, k); C.sc = mix(C.sc, S.sc, k); C.yaw = mix(C.yaw, S.yaw, k);
      C.morph = mix(C.morph, S.morph, ready && now - t0 < (TOUCH ? 900 : 2600) && !reduced ? (TOUCH ? .16 : .03) : k); C.dark = mix(C.dark, S.dark, k); C.alpha = mix(C.alpha, S.alpha, k);
      paint();
      if (!ready || !inView) return;
      if (SOFT) { if (now - lastR < 66) return; lastR = now; }
      if (!reduced && now - lastMove > 2500) mTarget = 0;
      mS = mix(mS, mTarget * (1 - C.morph), .08);
      px = mix(px, mx, .05); py = mix(py, my, .05);
      var halfH = Math.tan(17.5 * Math.PI / 180) * 6, halfW = halfH * cam.aspect;
      U.uMouse.value.set(mx * halfW, my * halfH, 0);
      U.uTime.value = (now - t0) / 1000; U.uMorph.value = C.morph; U.uDark.value = C.dark; U.uAlpha.value = C.alpha; U.uMS.value = mS;
      pts.position.set(C.x, C.y + (mob() ? 0 : .28), 0);
      pts.scale.setScalar(C.sc * (mob() ? 1 : .98));
      pts.rotation.y = C.yaw + (reduced ? 0 : (px * .32 + Math.sin(U.uTime.value * .25) * .05) * TURN);
      pts.rotation.x = reduced ? 0 : -py * .12 * TURN;
      renderer.render(scene, cam);
    }
    requestAnimationFrame(frame);
  })();

  /* every page (on home: after the particle-head opening): a field of small 3D particles drifting behind the whole page, top to bottom.
     It moves with depth as you scroll, flows gently, and scatters where the cursor or finger touches it. */

  /* shared: one download of the 3D library for the whole page, started as early as the device needs it */
  window.__three = window.__three || function (cb) {
    if (window.THREE) return cb();
    var q = window.__threeQ = window.__threeQ || []; q.push(cb); if (q.length > 1) return;
    var s = d.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.async = true;
    s.onload = function () { q.splice(0).forEach(function (f) { f(); }); }; d.head.appendChild(s);
  };
  var TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;
  /* devices with no graphics chip (software-only 3D drawing, as on speed-test machines): a lighter particle mode,
     fewer particles drawn at a gentler rate, so the page stays responsive. Any phone, tablet or computer with a
     graphics chip keeps the full effect. */
  /* one quick check of the device's 3D drawing, shared by the opening and the background particles */
  window.__gl = window.__gl || (function () {
    try {
      var c = d.createElement('canvas'), o = { failIfMajorPerformanceCaveat: true };
      var g = c.getContext('webgl', o) || c.getContext('experimental-webgl', o);
      if (!g) return { ok: true, soft: true };          /* no graphics chip (or no 3D): answered instantly, lighter mode on first interaction */
      var e = g.getExtension('WEBGL_debug_renderer_info'), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      var soft = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(n || ''));
      var lc = g.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
      return { ok: true, soft: soft };
    } catch (x) { return { ok: false }; }
  })();
  /* with a graphics chip: start as planned. Without one (software-only drawing): start on the visitor's first scroll,
     tap, key or mouse move, so loading the page never waits on the slow 3D set-up */
  window.__when3d = window.__when3d || function (f) {
    if (!window.__gl.soft) return f();
    var ev = ['pointerdown', 'pointermove', 'touchstart', 'wheel', 'keydown'], done = false;
    var h = function () { if (done) return; done = true; ev.forEach(function (x) { removeEventListener(x, h, true); }); f(); };
    ev.forEach(function (x) { addEventListener(x, h, { capture: true, passive: true }); });
  };
  window.__softGL = window.__softGL || function (r) {
    try { var g = r.getContext(), e = g.getExtension('WEBGL_debug_renderer_info'), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(n || '')); } catch (x) { return false; }
  };
  /* phones and tablets: size the 3D layer to the tallest screen once, so the address bar sliding away never forces a redraw */
  var tallH = function () { var p = d.createElement('div'); p.style.cssText = 'position:fixed;top:0;height:100lvh;width:0;visibility:hidden'; d.body.appendChild(p); var h = p.offsetHeight || innerHeight; p.remove(); return Math.max(h, innerHeight); };
  (function () {
    var opening = $('.pz');
    var gl = window.__gl.ok;
    if (!gl) return;
    var cv = d.createElement('canvas'); cv.className = 'px-cv'; cv.setAttribute('aria-hidden', 'true');
    d.body.insertBefore(cv, d.body.firstChild);
    d.documentElement.classList.add('px');
    var go = function () {
      window.__when3d(function () { window.__three(build); });
    };
    if (TOUCH && !opening) go();
    else if (d.readyState === 'complete') setTimeout(go, 30); else addEventListener('load', function () { setTimeout(go, 30); });
    function build() {
      var T = window.THREE; if (!T) return;
      var renderer; try { renderer = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false }); } catch (x) { return; }
      var small = innerWidth <= 760;
      renderer.setPixelRatio(small ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setClearColor(0, 0);
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, innerWidth / innerHeight, .1, 50); cam.position.set(0, 0, 6);
      var SOFT = window.__softGL(renderer), lastR = 0;
      var N = Math.round((small ? 1300 : 4200) / (SOFT ? 3 : 1)), seed = 23, rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      var pos = new Float32Array(N * 3), aR = new Float32Array(N * 4);
      for (var i = 0; i < N; i++) {
        pos[i * 3] = (rnd() * 2 - 1) * 4.2; pos[i * 3 + 1] = (rnd() * 2 - 1) * 3; pos[i * 3 + 2] = rnd() * 4 - 3;
        aR[i * 4] = rnd(); aR[i * 4 + 1] = rnd(); aR[i * 4 + 2] = rnd(); aR[i * 4 + 3] = rnd();
      }
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aR', new T.BufferAttribute(aR, 4));
      var U = { uTime: { value: 0 }, uScroll: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uMS: { value: 0 }, uMouse: { value: new T.Vector3(9, 9, 0) }, uFlow: { value: reduced ? 0 : 1 }, uAlpha: { value: 0 } };
      var mat = new T.ShaderMaterial({
        uniforms: U, transparent: true, depthWrite: false, depthTest: false,
        vertexShader: [
          'uniform float uTime,uScroll,uPR,uMS,uFlow,uAlpha; uniform vec3 uMouse;',
          'attribute vec4 aR; varying float vA; varying vec3 vC; varying float vRot;',
          'void main(){',
          '  float r=aR.x, r2=aR.y, t=uTime*uFlow;',
          '  vec3 p=position;',
          '  float depth=(p.z+3.)/4.;',
          '  p.y=mod(p.y+uScroll*(.35+depth*.9)+3.,6.)-3.;',
          '  p+=vec3(sin(t*.35+r*6.28+p.y*1.3),cos(t*.3+r2*6.28+p.x*1.1),sin(t*.27+r*3.1))*.08*uFlow;',
          '  vec4 wp=modelMatrix*vec4(p,1.);',
          '  vec4 sp=viewMatrix*wp; vec4 cp=projectionMatrix*sp;',
          '  vec2 ndc=cp.xy/cp.w; vec2 dd=ndc-uMouse.xy; dd.x*=uMouse.z; float dist=length(dd);',
          '  float push=(1.-smoothstep(0.,.32,dist))*uMS;',
          '  cp.xy+=(normalize(dd+vec2(1e-4))*(.08+.12*r)+vec2(r-.5,r2-.5)*.06)*push*cp.w;',
          '  gl_Position=cp;',
          '  gl_PointSize=(7.+aR.w*7.)*uPR*(6./-sp.z);',
          '  vec3 c1=vec3(.04,.045,.05), c2=vec3(.08,.5,.48), c3=vec3(.17,.71,.69), c4=vec3(.55,.47,.38);',
          '  vC=r<.42?c1:(r<.7?c2:(r<.88?c3:c4));',
          '  vA=uAlpha*mix(.14,.44,depth)*(.75+.25*r2);',
          '  vRot=r2*6.2831+t*(r-.5)*.4;',
          '}'].join('\n'),
        fragmentShader: [
          'varying float vA; varying vec3 vC; varying float vRot;',
          'float sdTri(vec2 p,float r){ const float k=1.7320508; p.x=abs(p.x)-r; p.y=p.y+r/k; if(p.x+k*p.y>0.) p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.; p.x-=clamp(p.x,-2.*r,0.); return -length(p)*sign(p.y); }',
          'void main(){ vec2 c=gl_PointCoord-.5; float cs=cos(vRot), sn=sin(vRot); c=vec2(c.x*cs-c.y*sn,c.x*sn+c.y*cs);',
          '  float a=(1.-smoothstep(.04,.1,abs(sdTri(c,.27))))*vA; if(a<.01) discard; gl_FragColor=vec4(vC,a); }'].join('\n')
      });
      var pts = new T.Points(g, mat); pts.frustumCulled = false; scene.add(pts);
      var sw = 0, size = function () {
        if (TOUCH && innerWidth === sw) return; sw = innerWidth;
        var H = TOUCH ? tallH() : innerHeight;
        renderer.setSize(innerWidth, H, false); cam.aspect = innerWidth / H; cam.updateProjectionMatrix();
      };
      size(); addEventListener('resize', size);
      var mx = 9, my = 9, mT = 0, mS = 0, last = 0, px = 0, py = 0, rx = 0, ry = 0, t0 = performance.now();
      if (!reduced) {
        var aim = function (e) { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight * 2 - 1); mT = 1; last = performance.now(); };
        addEventListener('pointermove', aim, { passive: true }); addEventListener('pointerdown', aim, { passive: true });
        addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') setTimeout(function () { mT = 0; }, 350); }, { passive: true });
        d.documentElement.addEventListener('pointerleave', function () { mT = 0; });
      }
      d.documentElement.classList.add('px-live');
      var draw = function (now) {
        var t = (now - t0) / 1000;
        if (!reduced && now - last > 2500) mT = 0;
        mS += (mT - mS) * .08; px += ((mx > 5 ? 0 : mx) - px) * .04; py += ((my > 5 ? 0 : my) - py) * .04;
        U.uTime.value = t; U.uMS.value = mS; U.uMouse.value.set(mx, my, cam.aspect);
        U.uScroll.value = (window.pageYOffset || 0) / innerHeight * 1.2;
        U.uAlpha.value = Math.min(1, t / (TOUCH ? .35 : 1.2));
        pts.rotation.y = reduced ? 0 : px * .12 + Math.sin(t * .05) * .06; pts.rotation.x = reduced ? 0 : -py * .08;
        renderer.render(scene, cam);
      };
      if (reduced) { U.uAlpha.value = 1; draw(performance.now()); addEventListener('scroll', function () { draw(performance.now()); }, { passive: true }); return; }
      var loop = function (now) { requestAnimationFrame(loop); if (d.hidden) return; if (opening && opening.getBoundingClientRect().bottom >= innerHeight) return; if (SOFT) { if (now - lastR < 66) return; lastR = now; } draw(now); };
      requestAnimationFrame(loop);
    }
  })();

})();
