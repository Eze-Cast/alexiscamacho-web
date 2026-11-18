// Seminuevos: hero, marcas, inventario, comparador y ficha. Datos en inventario.js,
// fichas-tecnicas.js y portadas.js; efectos compartidos en fx.js.
(() => {
  'use strict';
  const { $, $$, esc, money, number, toast, showModal, moveInk, reduced } = FX;
  const WA = '524778456675';
  const mileage = (c) => (c.km == null ? 'Km por confirmar' : number(c.km) + ' km');
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const waCar = (c) => waLink(`Hola Alexis, me interesa el ${c.name} ${c.year}, color ${c.color}, ${mileage(c)}, con precio de lista de ${money(c.price)}. ¿Sigue disponible?`);
  const plain = (s) => String(s).toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '');
  const brandLogo = (b) => `assets/marcas/${plain(b).replace(/[^a-z]/g, '')}.webp`;
  const CARS = INVENTARIO.filter((c) => c.photos?.[0]);
  const byId = new Map(CARS.map((c) => [c.id, c]));
  const TECH = typeof FICHAS_TECNICAS !== 'undefined' ? FICHAS_TECNICAS : {};
  const featured = [9, 5, 4, 6, 7, 11, 13];

  /* ---------- Hero: portadas activas ---------- */
  FX.heroCarousel(
    PORTADAS.filter((p) => byId.has(p.id)).map((p) => {
      const c = byId.get(p.id);
      const base = `assets/portadas/seleccion/${p.base}`;
      return {
        src: base + '.webp',
        srcset: `${base}-mobile.webp 960w, ${base}.webp 1920w, ${base}-4k.webp 3840w`,
        scene: `assets/escenarios/${p.scene}.webp`,
        alt: `${p.name} · seminuevo`,
        eyebrow: `${c.brand} · ${c.year}`,
        title: `${c.model} ${c.version || ''}`.trim(),
        sub: `${money(c.price)} · ${mileage(c)}`,
        onOpen: () => openDetail(c.id),
      };
    })
  );

  /* ---------- Marcas ---------- */
  const brands = [...new Set(CARS.map((c) => c.brand))].sort((a, b) => (a === 'Volkswagen' ? -1 : b === 'Volkswagen' ? 1 : a.localeCompare(b)));
  const chip = (b, hidden) => `<button type="button" class="brand-chip" data-brand="${esc(b)}" data-cursor="Filtrar" ${hidden ? 'aria-hidden="true" tabindex="-1"' : `aria-label="Ver ${esc(b)}"`}><img src="${brandLogo(b)}" alt="${hidden ? '' : esc(b)}" loading="lazy"/></button>`;
  $('#brandsA').innerHTML = brands.map((b) => chip(b)).join('') + brands.map((b) => chip(b, true)).join('');
  $('#brandsA').addEventListener('click', (e) => {
    const b = e.target.closest('[data-brand]');
    if (!b) return;
    $('#brand').value = b.dataset.brand;
    render();
    $('#inventario').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- Cifras ---------- */
  const prices = CARS.map((c) => c.price);
  const years = CARS.map((c) => c.year);
  $('#stUnits').dataset.to = CARS.length;
  $('#stBrands').dataset.to = brands.length;
  $('#stMin').dataset.to = Math.min(...prices);
  $('#stYears').textContent = `${Math.min(...years)}–${String(Math.max(...years)).slice(2)}`;

  /* ---------- Inventario ---------- */
  const tones = { blanco: '#f4f4f1', plata: '#aab0b6', gris: '#626b74', negro: '#1d2026', rojo: '#a32536', azul: '#2a5888', verde: '#6c8c51', ceramic: '#d9d8d1', arena: '#c8b48e', cafe: '#6b4a32', naranja: '#d06a28', amarillo: '#e2b830', beige: '#d6c7a8', vino: '#5e1a26', dorado: '#b89752', grafito: '#3c4249', perla: '#ece8df', titanio: '#7d828a' };
  const tone = (color) => tones[plain(color).split(' ')[0]] || '#8799aa';
  $('#brand').innerHTML += brands.map((b) => `<option>${esc(b)}</option>`).join('');
  const cats = CARS.reduce((m, c) => m.set(c.category, (m.get(c.category) || 0) + 1), new Map());
  $('#chips').innerHTML = `<button type="button" class="chip" data-cat="" aria-pressed="true">Todos <b>${CARS.length}</b></button>` + [...cats].map(([k, n]) => `<button type="button" class="chip" data-cat="${esc(k)}" aria-pressed="false">${esc(k)} <b>${n}</b></button>`).join('');
  let cat = '';
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat;
    $$('#chips .chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
    render();
  });
  const range = $('#maxPrice');
  const step = 10000;
  range.min = Math.floor(Math.min(...prices) / step) * step;
  range.max = Math.ceil(Math.max(...prices) / step) * step;
  range.step = step;
  range.value = range.max;
  const rangeLabel = () => ($('#maxPriceLabel').textContent = Number(range.value) >= Number(range.max) ? 'Sin límite' : money(range.value));
  rangeLabel();

  const chosen = new Map();
  const modelKey = (c) => `${c.brand}|${c.model}`;
  function pickDefault(units, sort) {
    const sel = units.find((u) => u.id === chosen.get(modelKey(units[0])));
    if (sel) return sel;
    const by = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, year: (a, b) => b.year - a.year, km: (a, b) => (a.km ?? 1e9) - (b.km ?? 1e9) }[sort];
    if (by) return [...units].sort(by)[0];
    return featured.map((id) => units.find((u) => u.id === id)).find(Boolean) || [...units].sort((a, b) => b.year - a.year || (a.km ?? 1e9) - (b.km ?? 1e9))[0];
  }
  let groups = [];
  let compared = [];
  function render() {
    const term = plain($('#search').value.trim());
    const brand = $('#brand').value;
    const max = Number(range.value);
    const sort = $('#sort').value;
    const units = CARS.filter((c) => plain(`${c.name} ${c.year} ${c.color} ${c.category}`).includes(term) && (!brand || c.brand === brand) && (!cat || c.category === cat) && c.price <= max);
    const map = new Map();
    units.forEach((u) => { const k = modelKey(u); map.has(k) || map.set(k, []); map.get(k).push(u); });
    groups = [...map.values()].map((us) => ({ key: modelKey(us[0]), units: us, active: pickDefault(us, sort) }));
    const rank = (g) => Math.min(...g.units.map((u) => (featured.includes(u.id) ? featured.indexOf(u.id) : 100 + u.id)));
    const sorters = { low: (a, b) => a.active.price - b.active.price, high: (a, b) => b.active.price - a.active.price, year: (a, b) => b.active.year - a.active.year, km: (a, b) => (a.active.km ?? 1e9) - (b.active.km ?? 1e9), featured: (a, b) => rank(a) - rank(b) };
    groups.sort(sorters[sort]);
    $('#count').innerHTML = `<b>${groups.length}</b> ${groups.length === 1 ? 'modelo' : 'modelos'} · ${units.length} ${units.length === 1 ? 'unidad' : 'unidades'}`;
    $('#grid').innerHTML = groups.length ? groups.map((g, i) => card(g, i)).join('') : '<p class="empty">No encontramos autos con esos filtros.<br/>Prueba otra marca o limpia la búsqueda.</p>';
  }
  function card(g, i) {
    const c = g.active;
    const colors = [...new Map(g.units.map((u) => [u.color, u])).values()];
    return `<article class="card" data-key="${esc(g.key)}" style="--i:${Math.min(i, 12)}">
      <button class="card-photo" data-car="${c.id}" aria-label="Ver ficha de ${esc(c.name)} ${c.year}" data-cursor="Ficha">
        <img src="${esc(c.thumbnail || c.photos[0])}" alt="${esc(`${c.name} ${c.year}, ${c.color}`)}" loading="lazy" decoding="async"/>
        <span class="badge">${esc(c.category)}</span>
        ${g.units.length > 1 ? `<span class="badge units-badge">${g.units.length} unidades</span>` : ''}
      </button>
      <div class="card-body">
        <div class="card-top"><span class="card-brand"><img src="${brandLogo(c.brand)}" alt="" loading="lazy"/>${esc(c.brand)}</span><span class="card-year">${c.year} · ${esc(c.color)}</span></div>
        <h3>${esc(c.model)}</h3>
        ${c.version ? `<span class="card-version">${esc(c.version)}</span>` : ''}
        <div class="specs"><span>${mileage(c)}</span><span>${esc(c.transmission)}</span>${TECH[c.specId]?.power ? `<span>${esc(TECH[c.specId].power.split(' a ')[0])}</span>` : ''}</div>
        ${g.units.length > 1 ? `<div class="colors">${colors.map((u) => `<button type="button" data-unit="${u.id}" style="--paint:${tone(u.color)}" aria-pressed="${u.color === c.color}" title="${esc(u.color)}" aria-label="Color ${esc(u.color)}"></button>`).join('')}
          <select data-unit-select aria-label="Elegir unidad">${g.units.map((u) => `<option value="${u.id}" ${u.id === c.id ? 'selected' : ''}>${esc([u.version, u.year].filter(Boolean).join(' '))} · ${money(u.price)}</option>`).join('')}</select></div>` : ''}
        <div class="card-bottom">
          <span class="price">${money(c.price)}<small>MXN</small></span>
          <div class="card-actions">
            <button type="button" class="icon-btn" data-compare="${c.id}" aria-pressed="${compared.includes(c.id)}" aria-label="Comparar" title="Comparar" data-cursor>⇆</button>
            <a class="icon-btn wa" href="${waCar(c)}" target="_blank" rel="noopener" aria-label="Me interesa por WhatsApp" title="Me interesa" data-cursor><svg viewBox="0 0 24 24"><path d="M20 11.6a8 8 0 0 1-11.9 7L3 20l1.4-4.9A8 8 0 1 1 20 11.6Z"/><path class="fill" d="M8 7.5c0 4 4.5 8 7.8 7.8l1.1-2-2.7-1.4-1.1 1c-1.7-.6-2.7-1.7-3.2-3.1l.9-1.1-1.3-2.5Z"/></svg></a>
          </div>
        </div>
      </div>
    </article>`;
  }
  function swapUnit(cardEl, id) {
    const g = groups.find((x) => x.key === cardEl.dataset.key);
    const u = g?.units.find((x) => x.id === id);
    if (!u) return;
    chosen.set(g.key, id);
    g.active = u;
    const tmp = document.createElement('div');
    tmp.innerHTML = card(g, 0);
    tmp.firstElementChild.style.animation = 'none';
    cardEl.replaceWith(tmp.firstElementChild);
  }
  $('#grid').addEventListener('click', (e) => {
    const unit = e.target.closest('[data-unit]');
    if (unit) return swapUnit(unit.closest('.card'), Number(unit.dataset.unit));
    const cmp = e.target.closest('[data-compare]');
    if (cmp) return toggleCompare(Number(cmp.dataset.compare));
    const open = e.target.closest('[data-car]');
    if (open) openDetail(Number(open.dataset.car));
  });
  $('#grid').addEventListener('change', (e) => { const s = e.target.closest('[data-unit-select]'); if (s) swapUnit(s.closest('.card'), Number(s.value)); });
  ['search', 'brand', 'sort', 'maxPrice'].forEach((id) => $('#' + id).addEventListener(id === 'search' || id === 'maxPrice' ? 'input' : 'change', () => { rangeLabel(); render(); }));
  $('#filters').addEventListener('submit', (e) => e.preventDefault());
  $('#reset').onclick = () => { $('#filters').reset(); range.value = range.max; cat = ''; $$('#chips .chip').forEach((x, i) => x.setAttribute('aria-pressed', i === 0)); rangeLabel(); render(); };

  /* ---------- Comparador ---------- */
  function toggleCompare(id) {
    if (compared.includes(id)) compared = compared.filter((x) => x !== id);
    else if (compared.length >= 3) return toast('Máximo 3 autos. Quita uno para agregar otro.');
    else { compared.push(id); toast(`${byId.get(id).model} agregado a la comparación`); }
    syncCompare();
  }
  function syncCompare() {
    $$('[data-compare]').forEach((b) => b.setAttribute('aria-pressed', compared.includes(Number(b.dataset.compare))));
    $$('[data-dcompare]').forEach((b) => (b.firstElementChild.textContent = compared.includes(Number(b.dataset.dcompare)) ? '✓ En comparación' : '⇆ Comparar'));
    $('#traySlots').innerHTML = [0, 1, 2].map((i) => {
      const c = byId.get(compared[i]);
      return c ? `<div class="tray-slot"><img src="${esc(c.thumbnail || c.photos[0])}" alt="${esc(c.model)}"/><button type="button" data-remove="${c.id}" aria-label="Quitar ${esc(c.model)}">✕</button></div>` : '<div class="tray-slot">+</div>';
    }).join('');
    $('#compareTray').classList.toggle('show', compared.length > 0);
    $('#trayOpen').disabled = compared.length < 2;
  }
  $('#traySlots').addEventListener('click', (e) => { const r = e.target.closest('[data-remove]'); if (r) toggleCompare(Number(r.dataset.remove)); });
  $('#trayClear').onclick = () => { compared = []; syncCompare(); };
  $('#trayOpen').onclick = () => {
    const cs = compared.map((id) => byId.get(id));
    const t = (c) => TECH[c.specId] || {};
    const best = (fn) => { const nums = cs.map(fn); const ok = nums.filter(Number.isFinite); return nums.map((n) => ok.length > 1 && n === Math.min(...ok)); };
    const row = (label, fn, b) => `<div class="cmp-row"><span>${label}</span>${cs.map((c, i) => `<div class="${b?.[i] ? 'best' : ''}">${fn(c) || '<span class="muted">Por confirmar</span>'}</div>`).join('')}</div>`;
    $('#compareContent').innerHTML = `<div class="cmp"><p class="eyebrow">ELIGE CON MÁS CLARIDAD</p><h2 id="cmpTitle">Frente <em>a frente.</em></h2>
      <div class="cmp-grid" style="--n:${cs.length}">
        <div class="cmp-row head"><span></span>${cs.map((c) => `<div><img src="${esc(c.thumbnail || c.photos[0])}" alt=""/><strong>${esc(c.brand)} ${esc(c.model)}</strong><small>${esc(c.version || '')}</small><a class="btn btn-glow btn-sm" href="${waCar(c)}" target="_blank" rel="noopener"><span>Me interesa</span></a></div>`).join('')}</div>
        ${row('Precio', (c) => money(c.price), best((c) => c.price))}
        ${row('Año', (c) => c.year, best((c) => -c.year))}
        ${row('Kilometraje', mileage, best((c) => c.km ?? NaN))}
        ${row('Transmisión', (c) => esc(c.transmission))}
        ${row('Color', (c) => esc(c.color))}
        ${row('Estilo', (c) => esc(c.category))}
        ${row('Motor', (c) => esc(t(c).engine))}
        ${row('Potencia', (c) => esc(t(c).power), best((c) => -parseInt(t(c).power) || NaN))}
        ${row('Torque', (c) => esc(t(c).torque))}
        ${row('Tracción', (c) => esc(t(c).drive))}
        ${row('Pasajeros', (c) => esc(t(c).passengers))}
        ${row('Cajuela', (c) => esc(t(c).trunk))}
      </div><p class="spec-note">★ Mejor valor de la comparación. Confirma el equipamiento instalado de cada unidad con el asesor.</p></div>`;
    showModal($('#compareModal'));
  };

  /* ---------- Ficha ---------- */
  const dl = (rows) => `<dl class="spec-list">${rows.filter(([, v]) => v != null && v !== '').map(([k, v], i) => `<div style="--i:${i}"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  const ul = (items) => `<ul class="eq-list">${items.map((x, i) => `<li style="--i:${i}">${esc(x)}</li>`).join('')}</ul>`;
  function openDetail(id) {
    const c = byId.get(id);
    if (!c) return;
    const t = TECH[c.specId];
    const tabs = [['Unidad', dl([['Año', c.year], ['Kilometraje', mileage(c)], ['Transmisión', c.transmission], ['Color', c.color], ['Estilo', c.category], ['Marca', c.brand]])]];
    if (t) {
      tabs.push(['Motor', dl([['Motor', t.engine], ['Potencia', t.power], ['Torque', t.torque], ['Transmisión', t.gearbox], ['Tracción', t.drive], ['Combustible', t.fuel]])]);
      tabs.push(['Capacidades', dl([['Dimensiones', t.dimensions], ['Pasajeros', t.passengers], ['Cajuela', t.trunk], ['Tanque', t.tank]])]);
      if (t.safety?.length) tabs.push(['Seguridad', ul(t.safety)]);
      if (t.equipment?.length) tabs.push(['Equipamiento', ul(t.equipment)]);
    }
    $('#detailContent').innerHTML = `<div class="detail">
        <div class="detail-photo"><img src="${esc(c.photos[0])}" alt="${esc(`${c.name} ${c.year}, ${c.color}`)}"/></div>
        <div class="detail-body">
          <p class="eyebrow">SEMINUEVO · ${esc(c.brand).toUpperCase()} · ${c.year}</p>
          <h2 id="detailTitle">${esc(c.name)}</h2>
          <div class="specs"><span>${mileage(c)}</span><span>${esc(c.transmission)}</span><span>${esc(c.color)}</span></div>
          <p class="price">${money(c.price)}<small>MXN</small></p>
          ${c.albumUrl ? `<a class="album-link" href="${esc(c.albumUrl)}" target="_blank" rel="noopener">Ver todas las fotos y videos ↗</a>` : ''}
          <div class="detail-actions">
            <a class="btn btn-glow" href="${waCar(c)}" target="_blank" rel="noopener"><span>Me interesa este auto</span><b>↗</b></a>
            <button type="button" class="btn btn-ghost" data-dcompare="${c.id}"><span>${compared.includes(c.id) ? '✓ En comparación' : '⇆ Comparar'}</span></button>
            <a class="btn btn-ghost" href="#auto-a-cuenta" data-close><span>↔ Tomamos tu auto a cuenta</span></a>
          </div>
          <p class="note">Precio de lista sujeto a cambio y disponibilidad. Consulta el precio final, impuestos aplicables y condiciones con el asesor.</p>
        </div>
      </div>
      <section class="spec-area">
        <p class="eyebrow">CONOCE EL AUTO A FONDO</p>
        <div class="tabs" role="tablist">${tabs.map(([n], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${n}</button>`).join('')}<i class="tab-ink"></i></div>
        ${tabs.map(([, html], i) => `<div role="tabpanel" data-panel="${i}" ${i ? 'hidden' : ''}>${html}</div>`).join('')}
        ${t ? `<p class="spec-note">${t.note ? esc(t.note) + ' ' : ''}Datos de fábrica para la versión indicada. <a href="${esc(t.source)}" target="_blank" rel="noopener">Referencia del fabricante ↗</a></p>` : '<p class="spec-note">Motor y equipamiento de esta versión por confirmar con el asesor.</p>'}
      </section>`;
    showModal($('#detail'));
    requestAnimationFrame(() => moveInk($('#detail [role=tab]')));
  }
  $('#detail').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      $$('#detail [data-tab]').forEach((b) => b.setAttribute('aria-selected', b === tab));
      $$('#detail [data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; if (!p.hidden) p.replaceWith(p.cloneNode(true)); });
      moveInk(tab);
    }
    const dc = e.target.closest('[data-dcompare]');
    if (dc) toggleCompare(Number(dc.dataset.dcompare));
  });

  /* ---------- Auto a cuenta ---------- */
  $('#tradeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const make = $('#tMake').value.trim(), year = $('#tYear').value.trim(), km = $('#tKm').value.trim();
    open(waLink(`Hola Alexis, quiero dar mi auto a cuenta y agendar una valuación. Tengo un ${make}${year ? ' ' + year : ''}${km ? ' con ' + km + ' km' : ''}.`), '_blank', 'noopener');
  });

  render();
  syncCompare();
})();
