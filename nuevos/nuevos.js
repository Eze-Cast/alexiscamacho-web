// Nuevos Volkswagen y SEAT: hero, catálogo por versión con colores, comparador y ficha.
// Datos en inventario.js, colores.js y fichas.js; efectos compartidos en ../fx.js.
(() => {
  'use strict';
  const { $, $$, esc, toast, showModal, moveInk, reduced } = FX;
  const WA = '524778456675';
  const plain = (v) => String(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const brand = (car) => car.brand || 'Volkswagen';
  const name = (car) => `${car.model} ${car.year}${car.model.includes(car.version) ? '' : ' ' + car.version}`;
  const transmission = (car) => (car.transmission === 'Por confirmar' ? 'Transmisión por confirmar' : car.transmission);
  const power = (car) => (car.power ? `${car.power} hp` : 'Por confirmar');
  const torque = (car) => (car.torque ? `${car.torque} Nm` : 'Por confirmar');
  const modelGroup = (car) => (car.model.startsWith('Saveiro') ? 'Saveiro' : car.model);
  const sceneFor = (car) => (car.category === 'Deportivo' ? 'circuit' : car.category === 'Pickup' ? 'offroad' : 'road');
  // URL absoluta: dentro de variables CSS una ruta relativa se resolvería contra ../disenio.css.
  const sceneUrl = (car) => new URL(`assets/escenarios/${sceneFor(car)}.webp`, location.href).href;
  const byId = new Map(INVENTARIO.map((c) => [c.id, c]));

  /* ---------- Colores ---------- */
  const selectedColors = new Map();
  const colorKey = (color) => color.toLowerCase().replaceAll(' / ', ' ').trim();
  const colorFor = (car) => selectedColors.get(car.id) || Object.keys(car.colors)[0];
  const imageInfo = (car) => COLOR_IMAGES[car.model]?.[colorKey(colorFor(car))] || { src: car.image };
  const paintNote = (car) => (imageInfo(car).generated ? 'Tono aproximado' : 'Imagen ilustrativa');
  const paintTone = (paint) => {
    const k = plain(paint);
    const map = [['blanco', '#f3f4f1'], ['negro', '#202125'], ['plata', '#b9bec3'], ['carbon', '#53595c'], ['ascot', '#b4b4aa'], ['moonstone', '#a1afb4'], ['oliva', '#717860'], ['verde', '#5f8a3c'], ['gris', '#7e858c'], ['azul', '#305a7c'], ['amarillo', '#d8ba37'], ['rojo', '#9e2034'], ['naranja', '#d06a28']];
    return (map.find(([w]) => k.includes(w)) || [, '#999da1'])[1];
  };
  const swatch = (color) => {
    const parts = color.split(' / ');
    return parts.length > 1 ? `linear-gradient(135deg,${paintTone(parts[0])} 0 58%,${paintTone(parts[1])} 58% 100%)` : paintTone(color);
  };
  const whatsapp = (car) => `https://wa.me/${WA}?text=` + encodeURIComponent(`Hola Alexis, me interesa el ${brand(car)} ${name(car)} (${transmission(car)}), en color ${colorFor(car)}. ¿Me compartes cotización, colores disponibles y fotos de la unidad?`);

  function carImage(car, lazy = true) {
    const body = `<img data-car-image="${car.id}" src="${esc(imageInfo(car).src)}" alt="${esc(`${brand(car)} ${car.model}, ${colorFor(car)} · imagen ilustrativa`)}" width="1440" height="720" ${lazy ? 'loading="lazy"' : ''} decoding="async">`;
    return car.wheelImage ? `<span class="seat-render">${body}<img class="seat-wheels" src="${esc(car.wheelImage)}" alt="" aria-hidden="true" width="1440" height="720" ${lazy ? 'loading="lazy"' : ''}></span>` : body;
  }
  function paintPicker(car) {
    return `<div class="paint-picker" role="group" aria-label="Colores de ${esc(name(car))}">
      <div class="paint-options">${Object.keys(car.colors).map((color) => `<button type="button" class="paint-button" data-paint-id="${car.id}" data-paint="${esc(color)}" title="${esc(color)}" aria-label="Ver en ${esc(color)}" aria-pressed="${colorFor(car) === color}" style="--paint:${swatch(color)}"></button>`).join('')}</div>
      <p class="selected-paint"><strong data-color-label="${car.id}">${esc(colorFor(car))}</strong><small data-color-note="${car.id}">${esc(paintNote(car))}</small></p>
    </div>`;
  }
  function selectPaint(id, color) {
    const car = byId.get(id);
    if (!car || !Object.hasOwn(car.colors, color)) return;
    selectedColors.set(id, color);
    $$(`[data-car-image="${id}"]`).forEach((img) => {
      const swap = () => {
        img.src = imageInfo(car).src;
        img.alt = `${brand(car)} ${car.model}, ${color} · imagen ilustrativa`;
        img.classList.remove('paint-out');
        img.classList.add('paint-in');
        setTimeout(() => img.classList.remove('paint-in'), 700);
      };
      if (reduced) return swap();
      img.classList.add('paint-out');
      setTimeout(swap, 220);
    });
    $$(`[data-color-label="${id}"]`).forEach((el) => (el.textContent = color));
    $$(`[data-color-note="${id}"]`).forEach((el) => (el.textContent = paintNote(car)));
    $$(`[data-paint-id="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', b.dataset.paint === color));
    $$(`[data-wa-car="${id}"]`).forEach((a) => (a.href = whatsapp(car)));
  }

  /* ---------- Hero ---------- */
  const models = [...new Set(INVENTARIO.map(modelGroup))].sort((a, b) => a.localeCompare(b, 'es'));
  const heroModels = ['Tiguan', 'Tera', 'Jetta', 'Taos', 'Virtus', 'GTI', 'Taigun', 'Nivus', 'Teramont', 'Saveiro Extreme'];
  FX.heroCarousel(
    heroModels.map((m) => INVENTARIO.find((c) => c.model === m && !c.wheelImage)).filter(Boolean).map((car) => ({
      src: car.image,
      scene: sceneUrl(car),
      alt: `${car.imageLabel} · imagen de referencia`,
      eyebrow: `${brand(car)} · Nuevo ${car.year}`,
      title: `${car.model} ${car.model.includes(car.version) ? '' : car.version}`.trim(),
      sub: `${car.engine} · ${power(car)}`,
      onOpen: () => showDetail(car.id),
    }))
  );

  /* ---------- Marquesina y cifras ---------- */
  const line = models.map((m) => `${esc(m.toUpperCase())} <em>✦</em> `).join('');
  $('#modelsMarquee').innerHTML = `<span>${line}</span><span>${line}</span>`;
  const allColors = new Set(INVENTARIO.flatMap((c) => Object.keys(c.colors)));
  $('#stModels').dataset.to = models.length;
  $('#stVersions').dataset.to = INVENTARIO.length;
  $('#stColors').dataset.to = allColors.size;
  $('#stBrands').dataset.to = new Set(INVENTARIO.map(brand)).size;

  /* ---------- Catálogo ---------- */
  models.forEach((m) => $('#model').add(new Option(m, m)));
  const cats = INVENTARIO.reduce((m, c) => m.set(c.category, (m.get(c.category) || 0) + 1), new Map());
  $('#chips').innerHTML = `<button type="button" class="chip" data-cat="" aria-pressed="true">Todos <b>${INVENTARIO.length}</b></button>` + [...cats].map(([k, n]) => `<button type="button" class="chip" data-cat="${esc(k)}" aria-pressed="false">${esc(k)} <b>${n}</b></button>`).join('');
  let cat = '';
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    cat = b.dataset.cat;
    $$('#chips .chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
    render();
  });
  const featured = ['Ibiza', 'Arona', 'Tiguan', 'Tera', 'Jetta', 'Taos', 'Virtus', 'GTI', 'Taigun', 'Nivus', 'Teramont', 'Saveiro Extreme', 'Saveiro Robust'];
  const selectedVersions = new Map();
  let selected = [];
  function render() {
    const term = plain($('#search').value.trim());
    const model = $('#model').value, trans = $('#transmission').value, order = $('#sort').value;
    const list = INVENTARIO.filter((car) =>
      (!model || modelGroup(car) === model) &&
      (!cat || car.category === cat) &&
      (!trans || (trans === 'automatic' ? ['DSG', 'Tiptronic'].includes(car.transmission) : car.transmission === trans)) &&
      (!term || plain([brand(car), name(car), ...Object.keys(car.colors)].join(' ')).includes(term)));
    list.sort((a, b) =>
      order === 'name' ? a.model.localeCompare(b.model, 'es') || b.year - a.year
        : order === 'year' ? b.year - a.year || a.model.localeCompare(b.model, 'es')
          : order === 'power' ? (b.power || 0) - (a.power || 0)
            : featured.indexOf(a.model) - featured.indexOf(b.model) || b.year - a.year);
    const groups = [...new Set(list.map(modelGroup))].map((m) => list.filter((c) => modelGroup(c) === m));
    $('#count').innerHTML = `<b>${groups.length}</b> ${groups.length === 1 ? 'modelo' : 'modelos'} · ${list.length} ${list.length === 1 ? 'versión' : 'versiones'}`;
    $('#grid').innerHTML = groups.length ? groups.map((variants, i) => card(variants, i)).join('') : '<p class="empty">No encontramos versiones con esos filtros.<br/>Prueba otro modelo o limpia la búsqueda.</p>';
  }
  function card(variants, i) {
    const car = variants.find((c) => c.id === selectedVersions.get(modelGroup(variants[0]))) || variants[0];
    return `<article class="card new-card" style="--i:${Math.min(i, 12)}">
      <button type="button" class="card-photo product-scene" style="--scene:url('${sceneUrl(car)}')" data-detail="${car.id}" aria-label="Ver ficha de ${esc(name(car))}" data-cursor="Ficha">
        ${carImage(car)}
        <span class="badge">${esc(car.category)}</span>
        <span class="badge units-badge">${esc(brand(car))}</span>
      </button>
      <div class="card-body">
        <div class="card-top"><span class="card-year">NUEVO · ${car.year}</span><span class="card-year">${esc(transmission(car))}</span></div>
        <h3>${esc(modelGroup(car))}</h3>
        <span class="card-version">${esc(car.version)}</span>
        <div class="specs"><span>${esc(car.engine)}</span><span>${esc(power(car))}</span><span>${esc(torque(car))}</span></div>
        ${variants.length > 1 ? `<label class="version-picker"><span>Versión</span><select data-version-model="${esc(modelGroup(car))}" aria-label="Versión de ${esc(car.model)}">${variants.map((c) => `<option value="${c.id}" ${c.id === car.id ? 'selected' : ''}>${c.year} · ${esc(c.version)} · ${esc(transmission(c))}</option>`).join('')}</select></label>` : ''}
        ${paintPicker(car)}
        <div class="card-bottom">
          <span class="quote-label">Cotización personal<small>Precio y promociones con Alexis</small></span>
          <div class="card-actions">
            <button type="button" class="icon-btn" data-compare="${car.id}" aria-pressed="${selected.includes(car.id)}" aria-label="Comparar" title="Comparar" data-cursor>⇆</button>
            <a class="icon-btn wa" data-wa-car="${car.id}" href="${whatsapp(car)}" target="_blank" rel="noopener" aria-label="Cotizar por WhatsApp" title="Cotizar" data-cursor><svg viewBox="0 0 24 24"><path d="M20 11.6a8 8 0 0 1-11.9 7L3 20l1.4-4.9A8 8 0 1 1 20 11.6Z"/><path class="fill" d="M8 7.5c0 4 4.5 8 7.8 7.8l1.1-2-2.7-1.4-1.1 1c-1.7-.6-2.7-1.7-3.2-3.1l.9-1.1-1.3-2.5Z"/></svg></a>
          </div>
        </div>
      </div>
    </article>`;
  }
  ['search', 'model', 'transmission', 'sort'].forEach((id) => $('#' + id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('#filters').addEventListener('submit', (e) => e.preventDefault());
  $('#reset').onclick = () => { $('#filters').reset(); cat = ''; $$('#chips .chip').forEach((x, i) => x.setAttribute('aria-pressed', i === 0)); render(); };
  $('#grid').addEventListener('change', (e) => {
    const picker = e.target.closest('[data-version-model]');
    if (!picker) return;
    selectedVersions.set(picker.dataset.versionModel, Number(picker.value));
    const tmp = document.createElement('div');
    const variants = [...$$('option', picker)].map((o) => byId.get(Number(o.value)));
    tmp.innerHTML = card(variants, 0);
    tmp.firstElementChild.style.animation = 'none';
    picker.closest('.card').replaceWith(tmp.firstElementChild);
  });

  /* ---------- Comparador ---------- */
  function toggleCompare(id) {
    if (selected.includes(id)) selected = selected.filter((x) => x !== id);
    else if (selected.length >= 3) return toast('Puedes comparar hasta tres versiones. Retira una para agregar otra.');
    else { selected.push(id); toast(`${byId.get(id).model} agregado a tu comparativa`); }
    syncCompare();
  }
  function syncCompare() {
    $$('[data-compare]').forEach((b) => b.setAttribute('aria-pressed', selected.includes(Number(b.dataset.compare))));
    $$('[data-dcompare]').forEach((b) => (b.firstElementChild.textContent = selected.includes(Number(b.dataset.dcompare)) ? '✓ En comparativa' : '⇆ Comparar'));
    $('#traySlots').innerHTML = [0, 1, 2].map((i) => {
      const c = byId.get(selected[i]);
      return c ? `<div class="tray-slot product-scene" style="--scene:url('${sceneUrl(c)}')"><img src="${esc(imageInfo(c).src)}" alt="${esc(c.model)}"/><button type="button" data-remove="${c.id}" aria-label="Quitar ${esc(c.model)}">✕</button></div>` : '<div class="tray-slot">+</div>';
    }).join('');
    $('#compareTray').classList.toggle('show', selected.length > 0);
    $('#trayOpen').disabled = selected.length < 2;
  }
  $('#traySlots').addEventListener('click', (e) => { const r = e.target.closest('[data-remove]'); if (r) toggleCompare(Number(r.dataset.remove)); });
  $('#trayClear').onclick = () => { selected = []; syncCompare(); };
  $('#trayOpen').onclick = () => {
    const cs = selected.map((id) => byId.get(id));
    const best = (fn) => { const n = cs.map(fn); const ok = n.filter(Number.isFinite); return n.map((x) => ok.length > 1 && x === Math.max(...ok)); };
    const row = (label, fn, b) => `<div class="cmp-row"><span>${label}</span>${cs.map((c, i) => `<div class="${b?.[i] ? 'best' : ''}">${esc(fn(c))}</div>`).join('')}</div>`;
    $('#compareContent').innerHTML = `<div class="cmp"><p class="eyebrow">UNA DECISIÓN MÁS CLARA</p><h2 id="cmpTitle">Compara. <em>Encuentra el tuyo.</em></h2>
      <div class="cmp-grid" style="--n:${cs.length}">
        <div class="cmp-row head"><span></span>${cs.map((c) => `<div><div class="cmp-photo product-scene" style="--scene:url('${sceneUrl(c)}')">${carImage(c, false)}</div><strong>${esc(brand(c))} ${esc(c.model)}</strong><small>${c.year} · ${esc(c.version)}</small><a class="btn btn-glow btn-sm" data-wa-car="${c.id}" href="${whatsapp(c)}" target="_blank" rel="noopener"><span>Cotizar</span></a></div>`).join('')}</div>
        ${row('Año', (c) => c.year, best((c) => c.year))}
        ${row('Versión', (c) => c.version)}
        ${row('Tipo', (c) => c.category)}
        ${row('Motor', (c) => c.engine)}
        ${row('Potencia', power, best((c) => c.power ?? NaN))}
        ${row('Torque', torque, best((c) => c.torque ?? NaN))}
        ${row('Transmisión', transmission)}
        ${row('Colores', (c) => Object.keys(c.colors).join(' · '))}
      </div><p class="spec-note">★ Mayor valor de la comparación. Imágenes de referencia; confirma equipamiento y disponibilidad con Alexis.</p></div>`;
    showModal($('#compareModal'));
  };

  /* ---------- Ficha ---------- */
  let activeDetail = null;
  function showDetail(id) {
    const car = byId.get(id);
    if (!car) return;
    activeDetail = car;
    $('#detailContent').innerHTML = `<div class="detail">
        <div class="detail-photo product-scene" style="--scene:url('${sceneUrl(car)}')">${carImage(car, false)}</div>
        <div class="detail-body">
          <p class="eyebrow">${esc(brand(car).toUpperCase())} · NUEVO ${car.year}</p>
          <h2 id="detailTitle">${esc(car.model)}</h2>
          <div class="specs"><span>${esc(car.version)}</span><span>${esc(transmission(car))}</span><span>${esc(power(car))}</span></div>
          ${paintPicker(car)}
          <div class="detail-actions">
            <a class="btn btn-glow" data-wa-car="${car.id}" href="${whatsapp(car)}" target="_blank" rel="noopener"><span>Cotizar con Alexis</span><b>↗</b></a>
            <button type="button" class="btn btn-ghost" data-dcompare="${car.id}"><span>${selected.includes(car.id) ? '✓ En comparativa' : '⇆ Comparar'}</span></button>
          </div>
          <p class="note">Imágenes de referencia; algunos tonos son aproximados. Confirma equipamiento, disponibilidad y tono real con Alexis.</p>
        </div>
      </div>
      <section class="spec-area">
        <p class="eyebrow">CONÓCELO A FONDO</p>
        <div class="tabs" role="tablist"><button type="button" role="tab" data-tab="specs" aria-selected="true">Especificaciones</button><button type="button" role="tab" data-tab="colors" aria-selected="false">Colores</button><button type="button" role="tab" data-tab="next" aria-selected="false">Cotiza y estrena</button><i class="tab-ink"></i></div>
        <div id="detailPanel" role="tabpanel"></div>
      </section>`;
    renderPanel('specs');
    showModal($('#detail'));
    requestAnimationFrame(() => moveInk($('#detail [role=tab]')));
  }
  const dl = (rows) => `<dl class="spec-list">${rows.map(([k, v], i) => `<div style="--i:${i}"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  function renderPanel(tab) {
    const car = activeDetail;
    $$('#detail [data-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
    moveInk($(`#detail [data-tab="${tab}"]`));
    if (tab === 'specs') {
      const key = (car.model.startsWith('Saveiro') ? 'saveiro' : car.model.toLowerCase()) + '-' + car.year;
      const sheet = FICHAS_OFICIALES[key];
      $('#detailPanel').innerHTML = dl([['Motor', car.engine], ['Potencia', power(car)], ['Torque', torque(car)], ['Transmisión', transmission(car)], ['Año modelo', car.year], ['Versión', car.version], ...(car.specs || [])]) +
        `<div class="sheet-links">${sheet ? `<a class="btn btn-ghost btn-sm" href="${esc(sheet.file)}" target="_blank" rel="noopener"><span>↓ Ficha técnica oficial ${car.year} · PDF</span></a>` : ''}<a class="album-link" href="${esc(car.sourceUrl || 'https://www.vw.com.mx/es/configurador.html')}" target="_blank" rel="noopener">Gama oficial ${esc(brand(car))} ↗</a></div>`;
    } else if (tab === 'colors') {
      $('#detailPanel').innerHTML = `<ul class="eq-list color-list">${Object.keys(car.colors).map((c, i) => `<li style="--i:${i}"><button type="button" data-paint-id="${car.id}" data-paint="${esc(c)}" aria-pressed="${colorFor(car) === c}"><i style="--paint:${swatch(c)}"></i>${esc(c)}</button></li>`).join('')}</ul><p class="spec-note">Solicita disponibilidad actual y fotografías del color que te interesa antes de decidir.</p>`;
    } else {
      $('#detailPanel').innerHTML = dl([['01 · Cotización', 'Consulta precio y promociones de esta versión.'], ['02 · Financiamiento', 'Pregunta por los planes y requisitos vigentes.'], ['03 · Tu visita', 'Coordina una cita para conocer tu auto nuevo.'], ['04 · A tu medida', 'Confirma color, equipamiento y tiempo de entrega.']]) + '<p class="spec-note">Precios, promociones y planes sujetos a disponibilidad, condiciones vigentes y aprobación cuando corresponda.</p>';
    }
  }

  /* ---------- Clics globales ---------- */
  document.addEventListener('click', (e) => {
    const paint = e.target.closest('[data-paint-id]');
    if (paint) return selectPaint(Number(paint.dataset.paintId), paint.dataset.paint);
    const tab = e.target.closest('#detail [data-tab]');
    if (tab) return renderPanel(tab.dataset.tab);
    const dc = e.target.closest('[data-dcompare]');
    if (dc) return toggleCompare(Number(dc.dataset.dcompare));
    const cmp = e.target.closest('[data-compare]');
    if (cmp) return toggleCompare(Number(cmp.dataset.compare));
    const det = e.target.closest('[data-detail]');
    if (det) showDetail(Number(det.dataset.detail));
  });

  render();
  syncCompare();
})();
