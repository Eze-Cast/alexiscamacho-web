# Mantenimiento del inventario

El sitio utiliza datos separados de la presentación:

- `inventario.js`: unidades activas, identificador estable, fotos, miniatura, precio, año, versión, kilometraje, transmisión y color.
- `fichas-tecnicas.js`: motor, potencia, torque, tracción, capacidades, seguridad, componentes y referencia de fábrica de cada unidad.
- `portadas.js`: diez recortes de portada vinculados a unidades activas. Se elige uno solo al recargar. El ciclo barajado muestra los diez antes de repetir y evita repetir el último al iniciar otro ciclo. Solo se descarga el elegido.
- `comparador.js`: selector visual, comparación de hasta tres autos y ficha ampliada.

Para actualizar una unidad:

1. Identificar la unidad exacta y su versión en el inventario. Mantener su ID si sigue siendo la misma unidad; usar uno nuevo para otro vehículo.
2. Guardar una foto real en WebP, más una miniatura. Comprobar que corresponden a la unidad.
3. Completar los datos comerciales y los campos técnicos con ficha oficial del país, año y versión. Distinguir las características verificadas de las configuraciones de referencia; nunca inventar los datos que falten.
4. Al retirar una unidad, eliminarla de `inventario.js`, retirar su ficha técnica y revisar si aparece en `portadas.js`. La portada filtra automáticamente las unidades inactivas.
5. Ejecutar `node validar-inventario.cjs`. Usar `--pendientes` para obtener los campos por verificar y `--estricto` para exigir que no queden pendientes.
6. Revisar filtros, fotos, WhatsApp, comparador y teléfono antes de entregar el cambio. Las comparaciones empiezan vacías en cada carga y se pueden quitar por separado o limpiar juntas.

Estado actual: 43 modelos de 18 marcas, una unidad disponible y una foto por modelo, 43 fichas estructuradas. Hay datos técnicos pendientes de verificar en las unidades, y referencias expresamente señaladas para las variantes ambiguas. El texto de más de 100 autos se refiere al inventario general de la agencia, según indicación del usuario; no al número de fichas publicadas.

Ubicación: Blvd. Adolfo López Mateos 2004, Col. Peñitas, C.P. 37180, León, Guanajuato. Verificada en https://leonmotors.mx/Contactanos/ y en la política de privacidad de Seminuevos León. El mapa usa la dirección exacta y el botón abre indicaciones de Google Maps.

Repositorio público: https://github.com/Eze-Cast/alexiscamacho-web. Publicación con GitHub Pages; dominio administrado en Hostinger. Actualizar primero los archivos locales, validar y subir los cambios a main.

Portadas: León, MX-5, BMW M135, Terramar y Formentor con circuito; BYD Sealion7, AudiQ5 y Tera con carretera; Wrangler y Taos con terracería. Son fondos decorativos. Solo se descarga el auto y escenario elegidos en cada carga; la animación de entrada y el desplazamiento no cambian la selección.

Fotografías de inventario: mantienen el fondo original de la agencia. Se retoca únicamente la iluminación/reflejos del vehículo y se conservan color, componentes, desgaste y estado visible. Una fotografía principal1440px y miniatura720px en WebP; carga diferida. No se sustituyen por recortes de portada.

Fuente de selección: PDF de noviembre2026,105 registros en tres bloques. Se agrupan marca y modelo; se excluyen unidades bloqueadas y se escoge una unidad con álbum por modelo. RenaultLogan se omite porque su fila no tiene enlace de fotografías en el PDF. Las23 unidades agregadas tienen identificadores21–43. El Peugeot2008 no tiene kilometraje informado; se muestra Porconfirmar, no0km. El kilometraje de Arona aparece con formato monetario en el PDF y se normaliza a8794km.

Las referencias de otra versión, país o año se indican expresamente. Arona tiene discrepancia entre transmisión manual del inventario y automática de la ficha; Transporter y Crafter requieren identificar carrocería/configuración. Los valores pendientes no se inventan. La validación también impide repetir marca+modelo.
