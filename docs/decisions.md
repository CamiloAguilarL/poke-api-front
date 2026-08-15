# Decisiones e inconsistencias resueltas

## Precedencia de fuentes

1. Condiciones explícitas de la prueba y del candidato.
2. Draft editable más reciente de Figma.
3. PDF de la prueba.
4. Mock data visual solo como composición, nunca como fuente de contenido productivo.

## Datos reales frente al mockup

Algunas cards de Figma asignan IDs o tipos incorrectos a especies concretas. La interfaz conserva el layout, pero nombre, ID, sprites, tipos, descripción, medidas, categoría, habilidades, género y debilidades proceden de PokeAPI.

El PDF cita únicamente `/pokemon` y `/pokemon/{name}`. Para no descargar el índice completo ni filtrar en memoria, el catálogo usa el endpoint GraphQL oficial v1beta2 con búsqueda, tipos, `limit` y `offset` en servidor. El detalle diseñado necesita información adicional, por lo que REST agrega `/pokemon-species`, `/ability` y `/type`. No se consulta la cadena evolutiva porque no existe en el frame final; así se evitan solicitudes N+1 sin valor visible. No se inventan fallbacks de negocio; cuando la API falla aparece el estado de error y reintento.

## Compartir

Figma no incluye la acción, pero el PDF la exige. Para conservar el frame mobile sin añadir controles, la acción se expone en la adaptación desktop junto al favorito. Clipboard copia todos los atributos visibles en segmentos separados por coma; las comas internas de la descripción se normalizan a punto y coma para que el contrato sea inequívoco.

## Onboarding y autenticación

El segundo frame dice “Regístrate”, pero no existe flujo de autenticación en el PDF ni diseños asociados. El texto se conserva pixel-perfect; completar onboarding solo persiste una preferencia local. No se introdujo un registro ficticio.

## Desktop

El correo pide adaptar una propuesta mobile a web sin aportar frames desktop. El catálogo sin selección usa todo el ancho útil con una grilla virtualizada adaptativa de hasta cinco columnas. Al seleccionar un Pokémon cambia a master-detail: rail estable, listado de 420 px y ficha simultánea con bloques de lectura de máximo 896 px. Esta extensión elimina gutters y paneles vacíos artificiales, conserva el lenguaje visual y evita estirar una card mobile a todo el viewport.

El onboarding conserva sin cambios las coordenadas del frame mobile. En desktop, artwork, mensaje, progreso y CTA se agrupan en una composición vertical centrada; así la acción permanece asociada al contenido y no se usa la altura adicional como espaciado arbitrario. El pixel art mantiene su tamaño fuente en lugar de escalarse para llenar la pantalla.

## Sprites diferenciados por contexto

Las tarjetas usan el sprite frontal liviano que puede derivarse directamente del ID entregado por GraphQL, evitando solicitudes REST N+1. La ficha usa, cuando existe, la variante `generation-ii/crystal` incluida en la respuesta REST de PokeAPI porque es la pose pixel art del frame de Figma; mantiene fallback al sprite frontal para Pokémon sin esa generación.

## Contraste de los chips de tipo

Los chips siguen la matriz del componente `Elementos Status` de Figma, sin inferir el color de contenido por luminancia. Eléctrico y Tierra usan `text/primary`; las otras 16 variantes usan `text/inverse`. El círculo usa `surface/default` y el pictograma conserva el color del tipo. Normal, Acero y Siniestro comparten `Status/steel` (`#546E7A`). Axe mantiene la excepción `color-contrast` porque varias combinaciones claras son una decisión explícita del componente fuente.

## Extensiones controladas

- Persistencia versionada de favoritos.
- Swipe-to-delete con alternativa de botón y undo.
- Localización española con fallback inglés.
- Regresión visual, axe, cobertura y CI.

No se añadieron autenticación, backend, base de datos, dark mode ni despliegue porque ampliarían el alcance sin evidencia de producto.
