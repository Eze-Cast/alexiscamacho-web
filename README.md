# Alexis Camacho — sitio web

Sitio estático editable en Visual Studio Code. Abre esta carpeta y utiliza Live Server o ejecuta `python -m http.server 5500` desde ella.

- `index.html`: secciones y textos de Seminuevos.
- `disenio.css`: paleta, diseño adaptable y animaciones (compartido con `nuevos/`).
- `fx.js`: pantalla de carga tipo tacómetro, cursor, revelados, carrusel del hero y transición entre Seminuevos y Nuevos.
- `seminuevos.js`: filtros, tarjetas, comparador, ficha y WhatsApp.
- `nuevos/`: catálogo de Volkswagen y SEAT nuevos (`nuevos.js` con colores, versiones y comparador).
- `inventario.js`: 43 modelos seleccionados y sus fotografías locales.
- `assets/autos/`: fotos obtenidas de los álbumes indicados en el inventario de la agencia.
- `assets/asesor-alexis.webp`: fotografía del asesor proporcionada por el usuario.

WhatsApp: +52 477 845 6675. Dominio activo: alexiscamacho.com.mx.

La portada es un carrusel de los recortes activos sobre su escenario: cambia cada 7 segundos o con las flechas, con entrada y salida animadas. Se respeta la preferencia del dispositivo de reducir movimiento (sin carrusel automático ni animaciones).

Los precios y kilometrajes proceden del inventario de noviembre de 2026. Antes de publicar hay que reconfirmar disponibilidad y condiciones comerciales. No se muestran VIN, ubicaciones internas ni ligas de álbumes al visitante.

Repositorio público: https://github.com/Eze-Cast/alexiscamacho-web. Se publica con GitHub Pages y el dominio alexiscamacho.com.mx, administrado en Hostinger. No hay formularios que almacenen datos ni analítica. Si se incorporan, preparar el aviso de privacidad correspondiente.

## Fotografías y portada

Cada auto incluye una foto WebP y una miniatura ligera. La ficha utiliza esa misma fotografía, sin botón de galería. La portada dispone de archivos adaptables de 960, 1920 y 3840 px; la variante de 3840 × 2160 está reescalada desde el recorte generado de 1672 × 941 y no equivale a una fotografía nativa 4K. El recorte editado se utiliza solo como imagen de portada; las fichas conservan las fotografías de las unidades.

Los logos se descargaron del conjunto público filippofilip95/car-logos-dataset. Sus fuentes se conservan en assets/marcas/fuentes.json. Se usan únicamente para identificar las marcas del inventario.

La identidad propia AC está en `assets/alexis-camacho-logo.svg` y `assets/ac-monograma.svg`. El comparador empieza vacío en cada recarga, admite hasta tres autos y tiene selección con fotos y búsqueda. Consulta `MANTENIMIENTO.md` para actualizar unidades y validar los campos técnicos pendientes.

Ubicación verificada: https://leonmotors.mx/Contactanos/ — Blvd. Adolfo López Mateos 2004, Col. Peñitas, León, Gto., C.P. 37180.

Inventario ampliado: 43 modelos de 18 marcas con una unidad disponible por modelo. Se conserva el fondo original de las fotos del inventario y se retocan los reflejos del coche. El Renault Logan se omite al no incluir una liga de fotos en el PDF.

Para modificar el sitio paso a paso, consulta `GUIA_EDICION.md`. El formato se comparte mediante `.editorconfig`, `.prettierrc.json` y `.vscode/settings.json`.

TikTok del asesor: https://www.tiktok.com/@alexc2c5. La portada incluye una cortina decorativa difuminada con las19marcas de la agencia, independiente de la selección aleatoria del coche.
