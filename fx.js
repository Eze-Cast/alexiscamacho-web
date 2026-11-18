// Efectos compartidos de alexiscamacho.com.mx: pantalla de carga, tema, cursor, revelados,
// carrusel del hero, comparador flotante y transiciones entre Seminuevos y Nuevos.
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
  const number = (n) => new Intl.NumberFormat('es-MX').format(n);
  const introHooks = [];
  let introDone = false;

  /* ---------- Tema (se comparte entre páginas) ---------- */
  const syncThemeColor = () => { const m = $('meta[name="theme-color"]'); if (m) m.content = root.dataset.theme === 'dark' ? '#050d18' : '#f6f9fc'; };
  syncThemeColor();
  $('#themeBtn')?.addEventListener('click', () => {
    const swap = () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('ac-theme', root.dataset.theme); } catch {}
      syncThemeColor();
    };
    document.startViewTransition && !reduced ? document.startViewTransition(swap) : swap();
  });

  /* ---------- Menú móvil ---------- */
  const menuBtn = $('#menuBtn');
  const nav = $('.nav');
  menuBtn?.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', nav.classList.toggle('open')));
  $$('.nav a').forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn?.setAttribute('aria-expanded', 'false'); }));

  /* ---------- Texto dividido por palabras ---------- */
  $$('[data-split]').forEach((el) => {
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(' ');
          const w = document.createElement('span');
          w.className = 'w';
          w.innerHTML = `<span style="--i:${i++}">${esc(part)}</span>`;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
  });

  /* ---------- Pantalla de carga ---------- */
  const pre = $('#preloader');
  let seen = false;
  try { seen = sessionStorage.getItem('ac-intro') === '1'; sessionStorage.setItem('ac-intro', '1'); } catch {}
  if (seen) root.classList.add('fast');
  function buildPreloader() {
    const ticks = $('.pre-ticks', pre);
    const N = 40, R = 112, C = 120;
    // 270° de tacómetro
    ticks.innerHTML = Array.from({ length: N + 1 }, (_, i) => {
      const a = (i / N) * 1.5 * Math.PI;
      const major = i % 5 === 0;
      const r1 = R - (major ? 14 : 8);
      return `<line class="${major ? 'major' : ''}" style="--t:${i}" x1="${C + Math.cos(a) * r1}" y1="${C + Math.sin(a) * r1}" x2="${C + Math.cos(a) * R}" y2="${C + Math.sin(a) * R}"/>`;
    }).join('');
    const title = $('.pre-title', pre);
    let c = 0;
    $$('span, b', title).forEach((part) => { part.innerHTML = [...part.textContent].map((ch) => `<span class="ch" style="--c:${c++}">${esc(ch)}</span>`).join(''); });
  }
  function runPreloader() {
    if (!pre) return finishIntro();
    buildPreloader();
    const fill = $('.pre-fill', pre);
    const len = fill.getTotalLength();
    const arc = len * 0.75;
    fill.style.strokeDasharray = `${arc} ${len}`;
    fill.style.strokeDashoffset = arc;
    const lines = $$('.pre-ticks line', pre);
    const minTime = seen ? 900 : 2600;
    const t0 = performance.now();
    let shown = 0, last = t0;
    const tick = (now = performance.now()) => {
      const elapsed = now - t0;
      const ready = document.readyState === 'complete' || elapsed > 4200;
      const target = Math.min(ready ? 100 : 88, (elapsed / minTime) * 100);
      // Avance según el tiempo real, no según cuadros: fluido aunque el equipo vaya lento.
      shown = Math.min(100, lerp(shown, target, Math.min(1, (now - last) / 120)) + 0.2);
      last = now;
      const k = shown / 100;
      $('#preCount').textContent = String(Math.floor(shown)).padStart(3, '0');
      fill.style.strokeDashoffset = arc * (1 - k);
      pre.style.setProperty('--needle', `${135 + 270 * k}deg`);
      const lit = Math.round(k * (lines.length - 1));
      lines.forEach((l, i) => l.classList.toggle('lit', i <= lit));
      if ((shown >= 99.5 && elapsed > minTime) || elapsed > 5000) return finishIntro();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Respaldo: si la pestaña pausa las animaciones, la página se muestra igual.
    setTimeout(finishIntro, 6000);
  }
  function finishIntro() {
    if (introDone) return;
    introDone = true;
    pre?.classList.add('done');
    root.classList.remove('loading');
    setTimeout(() => $$('.hero [data-split]').forEach((el) => el.classList.add('split-in')), 350);
    setTimeout(() => $$('.hero .reveal').forEach((el) => el.classList.add('in')), 350);
    setTimeout(() => pre?.classList.add('gone'), 1700);
    introHooks.splice(0).forEach((fn) => fn());
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  reduced ? setTimeout(finishIntro, 30) : runPreloader();

  /* ---------- Transición entre páginas ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-transition]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || reduced || !pre) return;
    e.preventDefault();
    pre.classList.remove('gone');
    pre.classList.add('leave');
    void pre.offsetWidth;
    pre.classList.remove('done');
    setTimeout(() => (location.href = a.href), 900);
  });
  addEventListener('pageshow', (e) => { if (e.persisted && pre) { pre.classList.remove('leave'); pre.classList.add('done', 'gone'); } });

  /* ---------- Revelado al hacer scroll + contadores ---------- */
  const countUp = (el) => {
    const to = Number(el.dataset.to || 0), isMoney = 'money' in el.dataset, t = performance.now();
    const fmt = (v) => (isMoney ? number(v) : v);
    if (reduced) return (el.textContent = fmt(to));
    const step = (now) => {
      const k = clamp((now - t) / 1800);
      el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 4))));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add(el.matches('[data-split]') ? 'split-in' : 'in');
    [...(el.matches('[data-count]') ? [el] : []), ...$$('[data-count]', el)].forEach(countUp);
    io.unobserve(el);
  }), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  const observeReveals = () => $$('.reveal, [data-split], .stat, .steps, .advisor-photo').filter((el) => !el.closest('.hero')).forEach((el) => io.observe(el));

  /* ---------- Tilt con brillo en tarjetas (un solo cálculo por cuadro) ---------- */
  function bindTilt(el) {
    if (!fine || reduced || el.dataset.tilt) return;
    el.dataset.tilt = 1;
    let rect = null, px = 0, py = 0, queued = false;
    const apply = () => {
      queued = false;
      if (!rect) return;
      const x = (px - rect.left) / rect.width, y = (py - rect.top) / rect.height;
      el.style.transform = `rotateX(${((0.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - 0.5) * 8).toFixed(2)}deg)`;
      el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
    };
    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); el.classList.add('tilting'); });
    el.addEventListener('pointermove', (e) => {
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
    el.addEventListener('pointerleave', () => { rect = null; el.classList.remove('tilting'); el.style.transform = ''; });
  }
  const grid = $('#grid');
  if (grid) new MutationObserver(() => $$('.card', grid).forEach(bindTilt)).observe(grid, { childList: true });

  /* ---------- Cursor, botones magnéticos y luz del hero ---------- */
  const cursor = $('.cursor');
  const heroEl = $('.hero');
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), cursorLabel = $('.cursor-label');
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  let magnet = null, lastTarget = null, cursorRunning = false, heroVisible = true;
  function cursorFrame() {
    rx = lerp(rx, cx, 0.22); ry = lerp(ry, cy, 0.22);
    dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    // El bucle se detiene solo cuando el anillo alcanza al puntero.
    if (Math.abs(rx - cx) + Math.abs(ry - cy) > 0.3) requestAnimationFrame(cursorFrame);
    else cursorRunning = false;
  }
  if (fine && !reduced) {
    addEventListener('pointermove', (e) => {
      cx = e.clientX; cy = e.clientY;
      if (cursor && !cursorRunning) { cursorRunning = true; requestAnimationFrame(cursorFrame); }
      // Solo la sección del hero recibe la posición del mouse (no toda la página).
      if (heroEl && heroVisible && scrollY < innerHeight) {
        heroEl.style.setProperty('--mx', (cx / innerWidth - 0.5).toFixed(3));
        heroEl.style.setProperty('--my', (cy / innerHeight - 0.5).toFixed(3));
      }
      if (e.target === lastTarget) {
        if (magnet) moveMagnet(e);
        return;
      }
      lastTarget = e.target;
      const m = e.target.closest?.('.magnetic') || null;
      if (magnet && magnet !== m) { magnet.style.transform = ''; }
      magnet = m;
      if (magnet) moveMagnet(e);
      if (cursor) {
        const t = e.target.closest?.('[data-cursor], a, button, select, input, label');
        const label = t?.dataset?.cursor;
        cursor.classList.toggle('hover', !!t && !label);
        cursor.classList.toggle('label', !!label);
        if (label) cursorLabel.textContent = label;
      }
    }, { passive: true });
  }
  function moveMagnet(e) {
    const r = magnet.getBoundingClientRect();
    magnet.style.transform = `translate3d(${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1)}px, 0)`;
  }

  /* ---------- Pausa animaciones que no están a la vista ---------- */
  const pauser = new IntersectionObserver((entries) => entries.forEach((e) => {
    e.target.classList.toggle('paused', !e.isIntersecting);
    if (e.target === heroEl) heroVisible = e.isIntersecting;
  }), { rootMargin: '100px 0px' });
  $$('.hero, .brands, .trade, .advisor, .closing, .map').forEach((el) => pauser.observe(el));

  /* ---------- Scroll: solo trabaja cuando la página se mueve ---------- */
  const header = $('#header');
  const heroTrack = $('.hero-track');
  const advisor = $('.advisor-photo');
  const bar = $('.scroll-progress i');
  const navLinks = $$('.nav a[href^="#"]');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let lastY = scrollY, hp = 0, hpTarget = 0, scrollQueued = false, hpRunning = false;
  let docMax = 1, heroMax = 1, sectionTops = [];
  const measure = () => {
    docMax = Math.max(1, root.scrollHeight - innerHeight);
    heroMax = heroTrack ? Math.max(1, heroTrack.offsetHeight - innerHeight) : 1;
    sectionTops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
  };
  function heroFrame() {
    hp = lerp(hp, hpTarget, 0.16);
    if (Math.abs(hpTarget - hp) < 0.001) hp = hpTarget;
    heroEl.style.setProperty('--hp', hp.toFixed(4));
    if (hp !== hpTarget) requestAnimationFrame(heroFrame);
    else hpRunning = false;
  }
  function onScroll() {
    scrollQueued = false;
    const y = scrollY;
    if (bar) bar.style.transform = `scaleX(${(y / docMax).toFixed(4)})`;
    if (heroTrack && heroEl && !reduced) {
      const t = clamp(y / heroMax);
      if (t !== hpTarget || hp !== t) {
        hpTarget = t;
        if (!hpRunning) { hpRunning = true; requestAnimationFrame(heroFrame); }
      }
    }
    if (header) {
      const scrolled = y > 40;
      if (header.classList.contains('scrolled') !== scrolled) header.classList.toggle('scrolled', scrolled);
      if (y > lastY + 4 && y > innerHeight * 1.2 && !nav?.classList.contains('open')) header.classList.add('hide');
      else if (y < lastY - 4) header.classList.remove('hide');
    }
    lastY = y;
    if (advisor && !reduced) {
      const ar = advisor.getBoundingClientRect();
      if (ar.bottom > 0 && ar.top < innerHeight) advisor.style.setProperty('--ap', clamp((innerHeight - ar.top) / (innerHeight + ar.height)).toFixed(3));
    }
    let current = -1;
    sectionTops.forEach((top, i) => { if (top - y < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => { if (a.classList.contains('active') !== (i === current)) a.classList.toggle('active', i === current); });
  }
  const requestScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', requestScroll, { passive: true });
  addEventListener('resize', () => { measure(); requestScroll(); }, { passive: true });
  addEventListener('load', () => { measure(); requestScroll(); });
  if (grid) new ResizeObserver(() => { measure(); }).observe(grid);

  /* ---------- Avisos y diálogos ---------- */
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2400);
  }
  let lastFocus;
  function showModal(d) {
    lastFocus = document.activeElement;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.addEventListener('close', () => { document.body.style.overflow = ''; lastFocus?.focus?.({ preventScroll: true }); });
  });
  function moveInk(btn) {
    const ink = btn?.parentElement?.querySelector('.tab-ink');
    if (!ink) return;
    ink.style.left = btn.offsetLeft + 'px';
    ink.style.width = btn.offsetWidth + 'px';
  }

  /* ---------- Carrusel del hero ----------
     items: [{ src, srcset?, scene, eyebrow, title, sub, onOpen }] */
  function heroCarousel(items, { duration = 7000 } = {}) {
    const img = $('#heroCar'), scene = $('#heroScene'), timer = $('#heroTimer'), tag = $('#heroTag'), heroEl = $('.hero');
    if (!img || !items.length) return;
    let idx = Math.floor(Math.random() * items.length), busy = false, auto = 0, started = false;
    $('#heroTotal').textContent = String(items.length).padStart(2, '0');
    const scenes = {};
    const setScene = (url) => {
      if (!url) return;
      if (!scenes[url]) {
        const s = document.createElement('img');
        s.alt = ''; s.decoding = 'async'; s.src = url;
        scene.append(s);
        scenes[url] = s;
      }
      Object.entries(scenes).forEach(([k, el]) => el.classList.toggle('on', k === url));
    };
    const paint = (it, dir) => {
      if (it.srcset) { img.srcset = it.srcset; img.sizes = '(max-width:860px) 100vw, 62vw'; } else img.removeAttribute('srcset');
      img.src = it.src;
      img.alt = it.alt || it.title;
      $('#heroCarWrap').style.setProperty('--car-mask', `url("${new URL(it.src, location.href).href}")`);
      const show = () => { img.className = 'hero-car ' + (dir < 0 ? 'enter-back' : 'enter'); busy = false; };
      img.decode ? img.decode().then(show, show) : show();
      setScene(it.scene);
      tag.classList.add('swap');
      setTimeout(() => {
        $('#heroTagBrand').textContent = it.eyebrow;
        $('#heroTagName').textContent = it.title;
        $('#heroTagPrice').textContent = it.sub;
        tag.classList.remove('swap');
      }, 350);
      $('#heroIdx').textContent = String(idx + 1).padStart(2, '0');
      const next = new Image();
      next.src = items[(idx + 1) % items.length].src;
    };
    const restart = () => {
      clearTimeout(auto);
      timer.classList.remove('run'); void timer.offsetWidth;
      if (reduced || items.length < 2) return;
      timer.style.setProperty('--dur', duration + 'ms');
      timer.classList.add('run');
      auto = setTimeout(() => go(1), duration);
    };
    function go(dir) {
      if (busy) return;
      busy = true;
      heroEl.classList.add('switching');
      img.className = 'hero-car ' + (dir < 0 ? 'leave-back' : 'leave');
      setTimeout(() => {
        idx = (idx + dir + items.length) % items.length;
        paint(items[idx], dir);
        setTimeout(() => heroEl.classList.remove('switching'), 600);
      }, reduced ? 0 : 700);
      restart();
    }
    $('#heroNext').onclick = () => go(1);
    $('#heroPrev').onclick = () => go(-1);
    tag.onclick = () => items[idx].onOpen?.();
    addEventListener('keydown', (e) => {
      if ($('dialog[open]') || e.target.matches('input, select, textarea') || scrollY > innerHeight) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    new IntersectionObserver(([e]) => {
      if (!started) return;
      if (e.isIntersecting) restart(); else { clearTimeout(auto); timer.classList.remove('run'); }
    }, { threshold: 0.3 }).observe(heroEl);
    onIntro(() => { started = true; busy = true; paint(items[idx], 1); restart(); });
  }

  function onIntro(fn) { introDone ? fn() : introHooks.push(fn); }

  addEventListener('DOMContentLoaded', () => {
    observeReveals();
    measure();
    onScroll();
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  });

  window.FX = { $, $$, esc, money, number, reduced, fine, toast, showModal, moveInk, bindTilt, heroCarousel, onIntro };
})();
