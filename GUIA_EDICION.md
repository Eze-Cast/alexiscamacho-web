# Guía para editar el sitio en Visual Studio Code

Abre **esta carpeta completa** en VS Code. Los archivos están en UTF-8, con sangría de dos espacios. La carpeta `.vscode` activa el formato al guardar con los formateadores incluidos en VS Code. No se necesita compilar el sitio para publicarlo.

## Qué archivo cambiar

| Cambio                                               | Archivo                  |
| ---------------------------------------------------- | ------------------------ |
| Textos, secciones y enlaces de contacto              | `index.html`             |
| Colores, tamaños, diseño en teléfono y animaciones   | `styles.css`             |
| Autos, precio, kilometraje, foto y marca             | `inventario.js`          |
| Especificaciones de fábrica de cada auto             | `fichas-tecnicas.js`     |
| Los diez autos de portada y el escenario de cada uno | `portadas.js`            |
| Tarjetas y búsqueda del inventario                   | `app.js`                 |
| Menús desplegables de marca, estilo y orden          | `filtros.js`             |
| Ficha en pestañas y comparación de autos             | `comparador.js`          |
| Comprobaciones antes de publicar                     | `validar-inventario.cjs` |

## Actualizar un auto

1. Busca su nombre en `inventario.js`. Cada objeto es una unidad y tiene un `id` único.
2. Cambia solo los campos necesarios. `price` y `km` son números sin separadores de miles. Si falta el kilometraje, usa `km: null`; la web mostrará “Kilometraje por confirmar”.
3. `brand` y `model` identifican el modelo sin versión. No agregues otra unidad con esa misma combinación: cambia la existente. SEAT León y CUPRA León son marcas distintas.
4. `photos` contiene una sola ruta. `thumbnail` apunta a su versión pequeña. Guarda las fotos de inventario en `assets/autos/` conservando el fondo original; utiliza WebP y comprueba que correspondan a la unidad.
5. Busca el mismo `id` en `fichas-tecnicas.js` y actualiza la ficha. Conserva `source` con la fuente oficial y `note` cuando una variante necesite confirmación. Nunca copies la ficha de otro modelo para completar campos.
6. Al retirar un auto, revisa también si su `id` está en `portadas.js`.

## Cambiar una portada

Cada entrada de `PORTADAS` indica `id`, `name`, `base` y `scene`. Los archivos están en `assets/portadas/seleccion/` y tienen versiones móvil, normal y grande. Deben conservar transparencia real y estar alineados con la misma base de las llantas.

- `scene: 'circuit'`: circuito para los deportivos.
- `scene: 'offroad'`: terracería para los vehículos de aventura.
- `scene: 'road'`: carretera para los de ciudad.

El coche y el escenario se eligen una vez al cargar el documento. No agregues temporizadores para cambiar imágenes. El historial barajado vive en `sessionStorage` con la clave `ac-hero-cycle-v2`; cada ciclo recorre los diez autos antes de repetir.

## Contacto y redes

WhatsApp usa el número internacional `524778456675`. El enlace directo de Instagram es `https://www.instagram.com/alexiscastillo.c/`, en la sección del asesor y el pie de página. No se carga un muro externo de publicaciones.

En el apartado del asesor, “Síguenos en nuestras redes sociales” agrupa Instagram y TikTok con sus logos. Las tarjetas y fichas incluyen “Tomamos tu auto a cuenta” junto a la consulta de WhatsApp.

## Tema y comparativa

`preferencias.css` contiene los ajustes de acciones, redes y tema oscuro. `preferencias.js` controla el botón de sol/luna junto a “Hablemos” y guarda la preferencia bajo `ac-theme` en `localStorage`. Las fotografías conservan sus colores; el tema cambia las superficies y los textos.

`comparador.js` lleva al visitante a la tabla cuando pasa de una opción a dos. Al recargar, la comparativa vuelve a estar vacía y la portada aparece primero; la preferencia de tema sí se conserva.

El Virtus publicado es ahora el Trendline gris 2025, manual, con 17,488 km y precio de lista de $289,900. Su imagen y miniatura son `assets/autos/virtus-gris-2025.webp` y `assets/autos/virtus-gris-2025-thumb.webp`. Al sustituir otra unidad, actualiza juntos color, kilometraje, precio, foto y versión de la ficha; conserva el chasis y el álbum de origen en los archivos privados de trabajo.

## Vista local y comprobaciones

Puedes abrir `index.html` con Live Server. Desde una terminal situada en esta carpeta también puedes ejecutar `python -m http.server 5500`, si Python está disponible.

Con Node, ejecuta `node validar-inventario.cjs`. La opción `--pendientes` muestra los datos por confirmar. Revisa además filtros, comparación, fotos y teléfono antes de publicar.

Si tienes Node con npm, `npm install` instala únicamente el formateador de desarrollo fijado en `package.json`. Después puedes usar `npm run format` y `npm run format:check`. El navegador no necesita estas herramientas: la web sigue siendo HTML, CSS y JavaScript estáticos.

## Publicación

El repositorio es `Eze-Cast/alexiscamacho-web`, rama `main`. GitHub Pages publica su raíz con el dominio `alexiscamacho.com.mx`. Sube archivos y recursos necesarios; no subas los originales privados del inventario, VIN, archivos temporales, claves ni álbumes internos.

## Copias de las imágenes

`respaldo-imagenes/` guarda43fotos retocadas de inventario,10recortes de portada y3escenarios en alta resolución. Para cambiar un recurso, conserva ese respaldo y exporta una copia WebP a `assets/`. El respaldo no se carga en la web ni forma parte de la publicación de GitHub.

TikTok del asesor: https://www.tiktok.com/@alexc2c5. La portada incluye una cortina decorativa difuminada con las19marcas de la agencia, independiente de la selección aleatoria del coche.
