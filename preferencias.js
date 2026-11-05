// Aplica el tema antes de pintar la página y conserva solo esta preferencia.
(() => {
  const root = document.documentElement;
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('ac-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    // La navegación privada puede impedir guardar preferencias.
  }
  root.dataset.theme = savedTheme;

  addEventListener(
    'DOMContentLoaded',
    () => {
      const button = document.getElementById('themeToggle');
      const themeColor = document.querySelector('meta[name="theme-color"]');
      function syncButton() {
        const dark = root.dataset.theme === 'dark';
        const label = dark ? 'Activar tema claro' : 'Activar tema oscuro';
        button.setAttribute('aria-pressed', String(dark));
        button.setAttribute('aria-label', label);
        button.title = label;
        themeColor.setAttribute('content', dark ? '#0a111c' : '#06264a');
      }
      button.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem('ac-theme', root.dataset.theme);
        } catch {
          // El botón sigue funcionando aunque no pueda persistirse la selección.
        }
        syncButton();
      });
      syncButton();
    },
    { once: true }
  );
})();
