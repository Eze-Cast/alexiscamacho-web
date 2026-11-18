"use strict";
// Inventario público: solo versiones disponibles; sin filas amarillas ni datos internos.
const $ = (selector) => document.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const name = (car) =>
  `${car.model} ${car.year}${car.model.includes(car.version) ? "" : " " + car.version}`;
const transmission = (car) =>
  car.transmission === "Por confirmar"
    ? "Transmisión por confirmar"
    : car.transmission;
const brand = (car) => car.brand || "Volkswagen";
const power = (car) => (car.power ? `${car.power} hp` : "Por confirmar");
const torque = (car) => (car.torque ? `${car.torque} Nm` : "Por confirmar");
const selectedColors = new Map();
const selectedVersions = new Map();
const colorKey = (color) => color.toLowerCase().replaceAll(" / ", " ").trim();
const colorFor = (car) =>
  selectedColors.get(car.id) || Object.keys(car.colors)[0];
const imageInfo = (car) => COLOR_IMAGES[car.model][colorKey(colorFor(car))];
const paintNote = (car) =>
  imageInfo(car).generated
    ? "Visualización de color · Tono aproximado"
    : "Imagen ilustrativa";
const paintTone = (paint) => {
  const key = normalize(paint);
  if (key.includes("blanco")) return "#f3f4f1";
  if (key.includes("negro")) return "#202125";
  if (key.includes("plata")) return "#b9bec3";
  if (key.includes("carbon")) return "#53595c";
  if (key.includes("ascot")) return "#b4b4aa";
  if (key.includes("moonstone")) return "#a1afb4";
  if (key.includes("oliva") || key.includes("verde")) return "#717860";
  if (key.includes("gris")) return "#7e858c";
  if (key.includes("azul")) return "#305a7c";
  if (key.includes("amarillo")) return "#d8ba37";
  if (key.includes("rojo")) return "#9e2034";
  return "#999da1";
};
function carImage(car) {
  const body =
    '<img data-car-image="' +
    car.id +
    '" src="' +
    esc(imageInfo(car).src) +
    '" alt="' +
    esc(brand(car) + " " + car.model + ", " + colorFor(car)) +
    ' · imagen oficial ilustrativa" width="1440" height="720" loading="lazy" decoding="async">';
  return car.wheelImage
    ? '<span class="seat-render">' +
        body +
        '<img class="seat-wheels" src="' +
        esc(car.wheelImage) +
        '" alt="" aria-hidden="true" width="1440" height="720" loading="lazy"></span>'
    : body;
}
function paintButtons(car) {
  return `<div class="paint-picker" role="group" aria-label="Colores disponibles de ${esc(name(car))}"><div class="paint-options">${Object.keys(
    car.colors,
  )
    .map((color) => {
      const parts = color.split(" / ");
      const background =
        parts.length > 1
          ? `linear-gradient(135deg,${paintTone(parts[0])} 0 58%,${paintTone(parts[1])} 58% 100%)`
          : paintTone(color);
      return `<button type="button" class="paint-button" data-paint-id="${car.id}" data-paint="${esc(color)}" title="${esc(color)}" aria-label="Ver ${esc(car.model)} en ${esc(color)}" aria-pressed="${colorFor(car) === color}"><span class="paint-dot" style="background:${background}"></span></button>`;
    })
    .join(
      "",
    )}</div><p class="selected-paint">Color: <strong data-color-label="${car.id}">${esc(colorFor(car))}</strong><span data-color-note="${car.id}">${esc(paintNote(car))}</span></p></div>`;
}
function selectPaint(id, color) {
  const car = INVENTARIO.find((item) => item.id === id);
  if (!car || !Object.hasOwn(car.colors, color)) return;
  selectedColors.set(id, color);
  document.querySelectorAll(`[data-car-image="${id}"]`).forEach((image) => {
    image.src = imageInfo(car).src;
    image.alt = `${brand(car)} ${car.model}, ${color} · imagen ilustrativa`;
  });
  document
    .querySelectorAll(`[data-color-label="${id}"]`)
    .forEach((label) => (label.textContent = color));
  document
    .querySelectorAll(`[data-color-note="${id}"]`)
    .forEach((label) => (label.textContent = paintNote(car)));
  document
    .querySelectorAll(`[data-paint-id="${id}"]`)
    .forEach((button) =>
      button.setAttribute("aria-pressed", button.dataset.paint === color),
    );
  document
    .querySelectorAll(`[data-wa-car="${id}"]`)
    .forEach((link) => (link.href = whatsapp(car)));
}
const whatsapp = (car, intent = "cotización") =>
  "https://wa.me/524778456675?text=" +
  encodeURIComponent(
    `Hola Alexis, me interesa el ${brand(car)} ${name(car)} (${transmission(car)}), en color ${colorFor(car)}. ¿Me compartes ${intent}, colores disponibles y fotos de la unidad?`,
  );
// Escenarios independientes: las fotografías del vehículo conservan su color y detalle.
const sceneFor = (car) =>
  car.category === "Deportivo"
    ? "circuit"
    : car.category === "Pickup"
      ? "offroad"
      : "road";
let selected = [];
let activeDetail = null;
let toastTimer;
const modelGroup = (car) =>
  car.model.startsWith("Saveiro") ? "Saveiro" : car.model;
const models = [...new Set(INVENTARIO.map(modelGroup))].sort((a, b) =>
  a.localeCompare(b, "es"),
);
models.forEach((model) => $("#model").add(new Option(model, model)));
$("#modelTotal").textContent = models.length;
$("#versionTotal").textContent = INVENTARIO.length;
$("#copyright").textContent = new Date().getFullYear();
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3500);
}
function renderInventory() {
  const term = normalize($("#search").value.trim());
  const model = $("#model").value;
  const category = $("#category").value;
  const trans = $("#transmission").value;
  const list = INVENTARIO.filter(
    (car) =>
      (!model || modelGroup(car) === model) &&
      (!category || car.category === category) &&
      (!trans ||
        (trans === "automatic"
          ? ["DSG", "Tiptronic"].includes(car.transmission)
          : car.transmission === trans)) &&
      (!term ||
        normalize([name(car), ...Object.keys(car.colors)].join(" ")).includes(
          term,
        )),
  );
  const order = $("#sort").value;
  const featured = [
    "Ibiza",
    "Arona",
    "Tiguan",
    "Tera",
    "Jetta",
    "Taos",
    "Virtus",
    "GTI",
    "Taigun",
    "Nivus",
    "Teramont",
    "Saveiro Extreme",
    "Saveiro Robust",
  ];
  list.sort((a, b) =>
    order === "name"
      ? a.model.localeCompare(b.model, "es") || b.year - a.year
      : order === "year"
        ? b.year - a.year || a.model.localeCompare(b.model, "es")
        : order === "power"
          ? (b.power || 0) - (a.power || 0)
          : featured.indexOf(a.model) - featured.indexOf(b.model) ||
            b.year - a.year,
  );
  const groups = [...new Set(list.map(modelGroup))].map((model) =>
    list.filter((car) => modelGroup(car) === model),
  );
  $("#resultCount").textContent =
    `${groups.length} modelos · ${list.length} versiones`;
  $("#grid").innerHTML = list.length
    ? groups
        .map((variants) => {
          const car =
            variants.find(
              (c) => c.id === selectedVersions.get(modelGroup(variants[0])),
            ) || variants[0];
          const versionPicker = `<label class="version-picker"><span>Versión y año</span><select data-version-model="${esc(modelGroup(car))}" aria-label="Versión y año de ${esc(car.model)}">${variants.map((c) => `<option value="${c.id}" ${c.id === car.id ? "selected" : ""}>${c.year} · ${esc(c.version)} · ${esc(transmission(c))}</option>`).join("")}</select></label>`;
          const colors = Object.keys(car.colors);
          return `<article class="card"><button type="button" class="card-photo product-scene" data-scene="${sceneFor(car)}" data-detail="${car.id}" aria-label="Ver ficha de ${esc(name(car))}">${carImage(car)}<span class="badge">${esc(car.category)}</span><small class="photo-ref">Imagen ilustrativa</small></button>${versionPicker}${paintButtons(car)}<div class="card-body"><span class="card-year">NUEVO · ${car.year}</span><h3>${esc(modelGroup(car))}</h3><p class="card-version">${esc(car.version)} · ${esc(transmission(car))}</p><div class="specs"><span>${esc(car.engine)}</span><span>·</span><span>${esc(power(car))}</span><span>·</span><span>${esc(torque(car))}</span></div><div class="card-bottom"><span class="quote-label">Tu nuevo ${esc(brand(car))}<small>Solicita una cotización personalizada</small></span><button type="button" class="view-car" data-detail="${car.id}" aria-label="Ver ficha de ${esc(name(car))}">↗</button></div><div class="card-actions"><button type="button" class="compare-toggle" data-compare="${car.id}" aria-pressed="${selected.includes(car.id)}">${selected.includes(car.id) ? "✓ En comparativa" : "＋ Comparar"}</button><a class="card-wa" data-wa-car="${car.id}" href="${whatsapp(car)}" target="_blank" rel="noopener">Me interesa ↗</a></div></div></article>`;
        })
        .join("")
    : '<p class="empty">No encontramos versiones con esos filtros. Prueba otro modelo o limpia la búsqueda.</p>';
}
$("#filters").addEventListener("submit", (event) => event.preventDefault());
["search", "model", "category", "transmission", "sort"].forEach((id) =>
  $("#" + id).addEventListener(
    id === "search" ? "input" : "change",
    renderInventory,
  ),
);
$("#reset").addEventListener("click", () => {
  $("#filters").reset();
  renderInventory();
});
function syncCompareButtons() {
  document.querySelectorAll("[data-compare]").forEach((button) => {
    const checked = selected.includes(Number(button.dataset.compare));
    button.setAttribute("aria-pressed", checked);
    button.textContent = checked ? "✓ En comparativa" : "＋ Comparar";
  });
  $("#navCount").textContent = selected.length;
}
function toggleCompare(id) {
  const previous = selected.length;
  if (selected.includes(id)) selected = selected.filter((item) => item !== id);
  else if (selected.length < 3) selected.push(id);
  else {
    notify(
      "Puedes comparar hasta tres versiones. Retira una para agregar otra.",
    );
    return;
  }
  renderComparison();
  syncCompareButtons();
  if (previous === 1 && selected.length === 2) {
    if ($("#detail").open) $("#detail").close();
    $("#comparar").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  } else if (selected.length > previous)
    notify("Versión agregada a tu comparativa.");
}
function renderComparison() {
  const cars = selected.map((id) => INVENTARIO.find((car) => car.id === id));
  $("#clearCompare").hidden = cars.length === 0;
  $("#compareStatus").textContent =
    cars.length < 2
      ? "Selecciona dos o tres versiones para comparar."
      : `${cars.length} versiones seleccionadas · Datos por versión según inventario.`;
  if (!cars.length) {
    $("#compareContent").innerHTML =
      '<div class="compare-empty"><p>¿Entre un sedán y una SUV?<br>Agrega tus favoritos con el botón <strong>＋ Comparar</strong> de cada tarjeta.</p><a class="button" href="#inventario">Elegir mis favoritos ↗</a></div>';
    return;
  }
  const rows = [
    ["Año", (car) => car.year],
    ["Versión", (car) => car.version],
    ["Tipo", (car) => car.category],
    ["Motor", (car) => car.engine],
    ["Potencia", power],
    ["Torque", torque],
    ["Transmisión", transmission],
    ["Colores de la versión", (car) => Object.keys(car.colors).join(" · ")],
  ];
  $("#compareContent").innerHTML =
    `<div class="table-wrap"><table class="compare-table"><thead><tr><th scope="col">Tu selección</th>${cars.map((car) => `<th scope="col"><div class="compare-photo product-scene" data-scene="${sceneFor(car)}">${carImage(car)}</div><button class="remove-compare" type="button" data-remove="${car.id}" aria-label="Retirar ${esc(name(car))}">×</button><h3>${esc(car.model)}</h3><small>${car.year} · ${esc(car.version)}</small></th>`).join("")}</tr></thead><tbody>${rows.map(([label, getter]) => `<tr><th scope="row">${label}</th>${cars.map((car) => `<td>${esc(getter(car))}</td>`).join("")}</tr>`).join("")}<tr><th scope="row">El siguiente paso</th>${cars.map((car) => `<td><button class="compare-details" type="button" data-detail="${car.id}">Ver ficha ↗</button><a class="button" data-wa-car="${car.id}" href="${whatsapp(car)}" target="_blank" rel="noopener">Cotizar ↗</a></td>`).join("")}</tr></tbody></table></div>${cars.length < 3 ? '<p class="detail-note"><a href="#inventario">＋ Agrega otra versión desde el inventario</a></p>' : ""}`;
}
$("#clearCompare").addEventListener("click", () => {
  selected = [];
  renderComparison();
  syncCompareButtons();
});
function showDetail(id) {
  const car = INVENTARIO.find((item) => item.id === id);
  if (!car) return;
  activeDetail = car;
  $("#detailContent").innerHTML =
    `<div class="detail-hero"><div class="detail-photo product-scene" data-scene="${sceneFor(car)}">${carImage(car)}</div><div><p class="eyebrow">${esc(brand(car).toUpperCase())} · NUEVO ${car.year}</p><h2 id="detailTitle">${esc(car.model)}</h2><p>${esc(car.version)}<br>${esc(transmission(car))}</p></div></div><div class="detail-body">${paintButtons(car)}<div class="detail-tabs" role="tablist" aria-label="Información de la versión"><button type="button" role="tab" id="tab-specs" data-tab="specs" aria-selected="true" aria-controls="detailPanel">Especificaciones</button><button type="button" role="tab" id="tab-colors" data-tab="colors" aria-selected="false" aria-controls="detailPanel" tabindex="-1">Colores disponibles</button><button type="button" role="tab" id="tab-next" data-tab="next" aria-selected="false" aria-controls="detailPanel" tabindex="-1">Cotiza y estrena</button></div><div id="detailPanel" role="tabpanel" aria-labelledby="tab-specs"></div><div class="detail-actions"><a class="button" data-wa-car="${car.id}" href="${whatsapp(car)}" target="_blank" rel="noopener">Cotizar con Alexis ↗</a><button type="button" class="compare-toggle" data-compare="${car.id}" aria-pressed="${selected.includes(car.id)}">${selected.includes(car.id) ? "✓ En comparativa" : "＋ Comparar"}</button></div></div>`;
  renderDetailPanel("specs");
  if (!$("#detail").open) $("#detail").showModal();
}
function renderDetailPanel(tab) {
  const car = activeDetail;
  document.querySelectorAll("[data-tab]").forEach((button) => {
    const active = button.dataset.tab === tab;
    button.setAttribute("aria-selected", active);
    button.tabIndex = active ? 0 : -1;
  });
  $("#detailPanel").setAttribute("aria-labelledby", "tab-" + tab);
  if (tab === "specs") {
    const fields = [
      ["Motor", car.engine],
      ["Potencia", power(car)],
      ["Torque", torque(car)],
      ["Transmisión", transmission(car)],
      ["Año modelo", car.year],
      ["Versión", car.version],
      ...(car.specs || []),
    ];
    const key =
      (car.model.startsWith("Saveiro") ? "saveiro" : car.model.toLowerCase()) +
      "-" +
      car.year;
    const sheet = FICHAS_OFICIALES[key];
    $("#detailPanel").innerHTML =
      `<dl class="spec-list">${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl><p class="detail-note">Confirma equipamiento, disponibilidad y tono real con Alexis. Imágenes de referencia.</p>${sheet ? `<a class="official-pdf" href="${sheet.file}" target="_blank" rel="noopener">↓ Ficha técnica oficial ${car.year} · PDF</a><p class="detail-note">Documento de ${esc(brand(car))} México. Revisa la columna de tu versión para conocer su equipamiento. <a href="${sheet.url}" target="_blank" rel="noopener">Ver fuente oficial ↗</a></p>` : ""}<p class="detail-note"><a href="${car.sourceUrl || "https://www.vw.com.mx/es/configurador.html"}" target="_blank" rel="noopener">Consulta la gama oficial ${esc(brand(car))} ↗</a></p>`;
  } else if (tab === "colors") {
    $("#detailPanel").innerHTML = `<ul class="color-list">${Object.keys(
      car.colors,
    )
      .map(
        (color) =>
          `<li><button type="button" class="color-text-button" data-paint-id="${car.id}" data-paint="${esc(color)}" aria-pressed="${colorFor(car) === color}">${esc(color)}</button></li>`,
      )
      .join(
        "",
      )}</ul><p class="detail-note">Colores registrados para esta versión. Solicita disponibilidad actual y fotografías del color que te interesa antes de decidir.</p>`;
  } else {
    $("#detailPanel").innerHTML =
      '<dl class="spec-list"><div><dt>01 · Cotización</dt><dd>Consulta precio y promociones de esta versión.</dd></div><div><dt>02 · Financiamiento</dt><dd>Pregunta por los planes y requisitos vigentes.</dd></div><div><dt>03 · Tu visita</dt><dd>Coordina una cita para conocer tu auto nuevo.</dd></div><div><dt>04 · A tu medida</dt><dd>Confirma color, equipamiento y tiempo de entrega.</dd></div></dl><p class="detail-note">La cotización se realiza de manera personal con Alexis. Los precios, promociones y planes están sujetos a disponibilidad, condiciones vigentes y aprobación cuando corresponda.</p>';
  }
}
document.addEventListener("click", (event) => {
  const paint = event.target.closest("[data-paint-id]");
  if (paint) {
    selectPaint(Number(paint.dataset.paintId), paint.dataset.paint);
    return;
  }
  const detail = event.target.closest("[data-detail]");
  const compare = event.target.closest("[data-compare]");
  const remove = event.target.closest("[data-remove]");
  const tab = event.target.closest("[data-tab]");
  if (detail) showDetail(Number(detail.dataset.detail));
  else if (compare) toggleCompare(Number(compare.dataset.compare));
  else if (remove) toggleCompare(Number(remove.dataset.remove));
  else if (tab) renderDetailPanel(tab.dataset.tab);
});
$("#detail").addEventListener("keydown", (event) => {
  if (
    !event.target.matches("[data-tab]") ||
    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
  )
    return;
  event.preventDefault();
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const current = tabs.indexOf(event.target);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
  renderDetailPanel(tabs[next].dataset.tab);
  tabs[next].focus();
});
$("#closeDetail").addEventListener("click", () => $("#detail").close());
$("#detail").addEventListener("click", (event) => {
  if (event.target === $("#detail")) {
    const box = $("#detail").getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      $("#detail").close();
  }
});
// Una portada por carga, alternando únicamente modelos presentes en el inventario.
const heroModels = [
  "Tiguan",
  "Tera",
  "Jetta",
  "Taos",
  "Virtus",
  "GTI",
  "Taigun",
  "Nivus",
  "Teramont",
  "Saveiro Extreme",
].filter((model) => models.includes(model));
let heroIndex = 0;
try {
  const previous = Number(
    sessionStorage.getItem("ac-prototipo-nuevos-hero-index"),
  );
  heroIndex = (previous + 1) % heroModels.length;
  sessionStorage.setItem("ac-prototipo-nuevos-hero-index", heroIndex);
} catch {
  heroIndex = Math.floor(Math.random() * heroModels.length);
}
const heroModel = heroModels[heroIndex];
const hero = INVENTARIO.find((car) => car.model === heroModel);
$("#heroCar").src = hero.image;
$("#heroCar").alt = hero.imageLabel + " · imagen de referencia";
$("#heroModel").textContent = heroModel;
renderInventory();
renderComparison();
// La recarga siempre deja vacía la comparativa, incluidos sus indicadores.
addEventListener("pageshow", () => {
  if (performance.getEntriesByType("navigation")[0]?.type !== "reload") return;
  selected = [];
  if ($("#detail").open) $("#detail").close();
  renderComparison();
  syncCompareButtons();
});

// Cada modelo conserva la versión seleccionada durante los filtros de esta visita.
document.addEventListener("change", (event) => {
  const picker = event.target.closest("[data-version-model]");
  if (!picker) return;
  selectedVersions.set(picker.dataset.versionModel, Number(picker.value));
  renderInventory();
});

const themeButton = document.querySelector("#themeToggle");
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeButton.setAttribute("aria-pressed", String(dark));
  themeButton.setAttribute(
    "aria-label",
    dark ? "Activar tema claro" : "Activar tema oscuro",
  );
}
themeButton.addEventListener("click", () => {
  const theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("ac-theme", theme); } catch {}
  updateThemeButton();
});
updateThemeButton();
