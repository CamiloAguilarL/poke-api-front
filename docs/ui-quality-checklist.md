# Checklist manual de calidad UI

Revisión final actualizada el 15 de agosto de 2026 sobre la aplicación real y los escenarios deterministas de Playwright. Esta lista complementa las aserciones automáticas: registra los microdetalles que también se inspeccionaron visualmente.

## Geometría responsive

- [x] `360×767` (frame fuente) y `360×800` (regresión): catálogo de una columna, navegación inferior y coordenadas críticas conservadas sin espacio fantasma.
- [x] `768×1024`: documento y app miden exactamente `768×1024`; catálogo de dos columnas.
- [x] `1024×900`: rail de 104 px, catálogo de 920 px y tres columnas, sin cards sobredimensionadas.
- [x] `1440×900`: rail de 104 px, catálogo de 1336 px y cuatro columnas.
- [x] `1917×957`: app de `1917×957`, catálogo de 1813 px y cinco columnas; los cuatro bordes coinciden con el viewport.
- [x] `1920×1080`: app de `1920×1080`, catálogo de 1816 px y cinco columnas.
- [x] Ningún viewport presenta overflow horizontal, gutter lateral artificial ni espacio fantasma inferior.
- [x] La ruta de catálogo usa todo el ancho útil; la ruta de detalle conserva el listado de 420 px y centra la composición visual/lectura en un máximo de 1120 px.
- [x] La cabecera de búsqueda conserva un ancho cómodo en desktop y no estira el input hasta una longitud difícil de leer.
- [x] El onboarding desktop agrupa artwork, copy, progreso y CTA como una sola unidad centrada; el botón conserva relación visual con la imagen en 1440 y 1920 px.
- [x] La lista virtual mantiene altura de fila, gaps, padding y alineación constante mientras cambia el número de columnas.

## Fidelidad visual y sistema de diseño

- [x] Radios, sombras, bordes, espaciado, Poppins y colores proceden de tokens semánticos compartidos.
- [x] Cards, botones, inputs, links, toggles, sheets, badges, skeletons, toasts y skip link atraviesan primitives propios de estilo shadcn.
- [x] ESLint impide controles HTML nativos o acceso directo a `RouterLink`/`vue-sonner` fuera de `components/ui`.
- [x] Los 18 iconos de tipo se renderizan como máscaras con `currentColor`; ninguno se pierde contra el color del chip.
- [x] Los iconos de tipos se verificaron en cards, hero, debilidades y detalle; el filtro conserva los checkboxes sin icono definidos por Figma.
- [x] Los chips preservan contraste de texto e icono tanto en fondos claros como oscuros.
- [x] Sprites, artwork, anillos, favoritos y controles del hero conservan tamaño, centro y jerarquía visual.
- [x] Nombres largos se truncan en cards; descripciones y títulos usan wrapping intencional sin desbordar.
- [x] Valores numéricos —IDs, resultados, medidas, porcentajes y multiplicadores— usan cifras tabulares.

## Interacción y estados

- [x] Pokédex, Favoritos, Regiones y Perfil comparten una cabecera de sección consistente con un único `h1`; Favoritos no muestra un botón de volver redundante con la navegación principal.
- [x] El campo de búsqueda tiene label asociado, `name`, autocomplete, teclado de búsqueda, enter key hint y spellcheck adecuados.
- [x] El control nativo de limpieza del input está suprimido; con texto existe exactamente una acción “Limpiar búsqueda”.
- [x] El filtro contiene 18 checkboxes accesibles, selección múltiple, scroll interno, cancelar y aplicar; las primeras seis opciones y su orden coinciden con Figma.
- [x] El sheet contiene su propio scroll, mantiene las acciones ancladas al borde inferior, respeta el safe area, entra/sale verticalmente en mobile y evita propagar overscroll al documento; en desktop presenta los 18 tipos en dos columnas y las acciones en una fila, sin controles decorativos que aparenten interacción.
- [x] Overlay de sheet al 76%, elevación del diálogo, sombras de hover, sprite y loader usan tokens semánticos; ningún borde corta la sombra de las cards extremas.
- [x] Todos los botones solo-icono inspeccionados tienen nombre accesible y los toggles exponen su estado.
- [x] Cards y detalles mobile/desktop reutilizan el mismo `FavoriteButton`: círculo translúcido con borde blanco y corazón activo rojo mediante `--favorite`.
- [x] Botones, links y toggles centralizados usan `touch-action: manipulation`; el swipe conserva desplazamiento vertical.
- [x] La navegación inferior mobile permanece fija al viewport en catálogo, detalle, favoritos y estados; el contenido reserva 77 px para que el último bloque nunca quede oculto.
- [x] Favorito funciona desde card y detalle; eliminación por swipe dispone de botón equivalente y undo.
- [x] Compartir copia nombre y todos los atributos visibles; el toast confirma la operación.
- [x] Loading, error/retry, búsqueda sin resultados, favoritos vacíos, favoritos hidratando y secciones futuras tienen representación explícita.
- [x] Back, compartir, favorito desde detalle y persistencia después de recargar se revisaron dentro de los flujos E2E.
- [x] En master-detail, catálogo y ficha conservan scroll independiente; cambiar de Pokémon reinicia solo el panel derecho arriba y cambiar query no desmonta la ficha.

## Accesibilidad y robustez

- [x] El primer foco por teclado expone “Saltar al contenido” y apunta a `#main-content`.
- [x] El foco visible está definido para botones, links, inputs y contenido del diálogo.
- [x] `prefers-reduced-motion` neutraliza animaciones y transiciones no esenciales.
- [x] Axe no reporta violaciones críticas ni serias en onboarding, catálogo, detalle, error, favoritos vacíos y construcción; solo se excluye el primitive Badge por la decisión de contraste fiel a Figma.
- [x] Todas las imágenes inspeccionadas tienen texto alternativo y dimensiones explícitas; no hubo imágenes rotas.
- [x] No se encontraron botones sin texto o `aria-label`, errores de consola ni excepciones de página durante el flujo principal.
- [x] La app usa `dvh`, safe area inferior y `viewport-fit=cover` para responder a chrome móvil y dispositivos con inset.
- [x] La lista pide páginas remotas de 40 con infinite scroll, virtualiza filas y no descarga el índice completo; favoritos se rehidratan en lotes GraphQL de máximo 100 sin N+1 REST.
- [x] Búsqueda parcial, ID y tipos viajan a GraphQL; ningún resultado se filtra localmente.

## Evidencia automatizada

- [x] 53 pruebas unitarias.
- [x] Matriz Playwright de 68 entradas entre `360×800`, `768×1024`, `1440×900` y `1920×1080`: 24 escenarios aplicables y 44 combinaciones no aplicables omitidas explícitamente.
- [x] Regresión visual de onboarding, catálogo, búsqueda, filtros, detalle, favoritos, swipe, loading, error, vacío y construcción.
- [x] Aserciones geométricas bloquean regresiones del ancho/alto del documento, shell, catálogo y artwork.
- [x] Cobertura actual: 99,39% statements, 100% functions, 100% lines y 92,45% branches sobre el alcance configurado.
