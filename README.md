# Alexis Camacho — sitio web

Sitio estático editable en Visual Studio Code. Abre esta carpeta y utiliza Live Server o ejecuta `python -m http.server 5500` desde ella.

- `index.html`: secciones y textos.
- `styles.css`: colores, diseño adaptable y animaciones.
- `app.js`: filtros, galerías, WhatsApp y acercamiento sutil al desplazarse.
- `inventario.js`: 20 vehículos seleccionados y sus fotografías locales.
- `assets/autos/`: fotos obtenidas de los álbumes indicados en el inventario de la agencia.
- `assets/asesor.webp`: imagen temporal proporcionada por el usuario.

WhatsApp: +52 477 845 6675. Dominio previsto: alexiscamacho.com.mx.

La portada muestra un recorte aleatorio entre cinco vehículos activos, con entrada suave y líneas de luz de fondo. No tiene datos de versión ni movimientos de balanceo. La imagen conserva su ángulo y no responde al cursor; no es un modelo 3D giratorio. Se respeta la preferencia del dispositivo de reducir movimiento.

Los precios y kilometrajes proceden del inventario de noviembre de 2026. Antes de publicar hay que reconfirmar disponibilidad y condiciones comerciales. No se muestran VIN, ubicaciones internas ni ligas de álbumes al visitante.

Pendiente de revisión del usuario antes de crear o subir el repositorio a GitHub y configurar Hostinger. No hay formularios que almacenen datos ni analítica. Si se incorporan, preparar el aviso de privacidad correspondiente.

## Fotografías y portada
Cada auto incluye una foto WebP y una miniatura ligera. Las otras vistas se solicitan al abrir la galería. La portada dispone de archivos adaptables de 960, 1920 y 3840 px; la variante de 3840 × 2160 está reescalada desde el recorte generado de 1672 × 941 y no equivale a una fotografía nativa 4K. El recorte editado se utiliza solo como imagen de portada; las fichas conservan las fotografías de las unidades.

Los logos se descargaron del conjunto público filippofilip95/car-logos-dataset. Sus fuentes se conservan en assets/marcas/fuentes.json. Se usan únicamente para identificar las marcas del inventario.


La identidad propia AC está en `assets/alexis-camacho-logo.svg` y `assets/ac-monograma.svg`. El comparador empieza vacío en cada recarga, admite hasta tres autos y tiene selección con fotos y búsqueda. Consulta `MANTENIMIENTO.md` para actualizar unidades y validar los campos técnicos pendientes.

Ubicación verificada: https://leonmotors.mx/Contactanos/ — Blvd. Adolfo López Mateos 2004, Col. Peñitas, León, Gto., C.P. 37180.
