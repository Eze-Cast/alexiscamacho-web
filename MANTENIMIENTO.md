# Mantenimiento del inventario

El sitio utiliza datos separados de la presentación:

- `inventario.js`: unidades activas, identificador estable, fotos, miniatura, precio, año, versión, kilometraje, transmisión y color.
- `fichas-tecnicas.js`: motor, potencia, torque, tracción, capacidades, seguridad, componentes y referencia de fábrica de cada unidad.
- `portadas.js`: cinco recortes de portada vinculados a unidades activas. Se elige uno por carga y se evita repetir el inmediatamente anterior. Solo se descarga el elegido.
- `comparador.js`: selector visual, comparación de hasta tres autos y ficha ampliada.

Para actualizar una unidad:

1. Identificar la unidad exacta y su versión en el inventario. Mantener su ID si sigue siendo la misma unidad; usar uno nuevo para otro vehículo.
2. Guardar una foto real en WebP, más una miniatura. Comprobar que corresponden a la unidad.
3. Completar los datos comerciales y los campos técnicos con ficha oficial del país, año y versión. Distinguir las características verificadas de las configuraciones de referencia; nunca inventar los datos que falten.
4. Al retirar una unidad, eliminarla de `inventario.js`, retirar su ficha técnica y revisar si aparece en `portadas.js`. La portada filtra automáticamente las unidades inactivas.
5. Ejecutar `node validar-inventario.cjs`. Usar `--pendientes` para obtener los campos por verificar y `--estricto` para exigir que no queden pendientes.
6. Revisar filtros, fotos, WhatsApp, comparador y teléfono antes de entregar el cambio. Las comparaciones empiezan vacías en cada carga y se pueden quitar por separado o limpiar juntas.

Estado actual: 20 unidades destacadas, una foto por unidad, 20 fichas estructuradas. Hay datos técnicos pendientes de verificar en las unidades, y referencias expresamente señaladas para las variantes ambiguas. El texto de más de 100 autos se refiere al inventario general de la agencia, según indicación del usuario; no al número de fichas publicadas.

Ubicación: Blvd. Adolfo López Mateos 2004, Col. Peñitas, C.P. 37180, León, Guanajuato. Verificada en https://leonmotors.mx/Contactanos/ y en la política de privacidad de Seminuevos León. El mapa usa la dirección exacta y el botón abre indicaciones de Google Maps.

Repositorio público: https://github.com/Eze-Cast/alexiscamacho-web. Publicación con GitHub Pages; dominio administrado en Hostinger. Actualizar primero los archivos locales, validar y subir los cambios a main.

Portadas: Tera y Taos con paisaje de terracería; Polo con carretera; León y Mazda MX-5 con circuito. Los escenarios son imágenes decorativas generadas; las variantes de 3840 px son ampliadas a partir del original, no fotografías 4K nativas. Solo se solicita el coche y escenario elegidos en cada carga.
