# Pokédex · Prueba Front End

Pokédex construida con Vue 3 a partir del diseño mobile de Figma y adaptada a una experiencia web completa. La solución prioriza datos reales, rendimiento con más de mil registros, consistencia visual, accesibilidad y una arquitectura fácil de mantener.

[Figma editable](https://www.figma.com/design/4Uh3KoeuzsYusZ90pa4l1M/Pok%C3%A9dex--Copy-?node-id=0-1&p=f) · [Requisitos](docs/requirements.md) · [Arquitectura](docs/architecture.md) · [Decisiones](docs/decisions.md)

## Evidencia visual

Las imágenes son goldens reales de Playwright y forman parte de la regresión visual del proyecto.

| Onboarding                                                                                        | Catálogo                                                                                         | Filtros                                                                                        | Detalle                                                                                        |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| <img src="tests/e2e/__screenshots__/mobile-360/onboarding-01.png" width="185" alt="Onboarding" /> | <img src="tests/e2e/__screenshots__/mobile-360/catalog.png" width="185" alt="Catálogo mobile" /> | <img src="tests/e2e/__screenshots__/mobile-360/filter.png" width="185" alt="Filtros mobile" /> | <img src="tests/e2e/__screenshots__/mobile-360/detail.png" width="185" alt="Detalle mobile" /> |

<img src="tests/e2e/__screenshots__/desktop-1920/detail.png" width="960" alt="Experiencia master-detail en desktop" />

En mobile se conserva el lenguaje y la geometría del Figma. En desktop, el catálogo usa el ancho disponible sin escalar indefinidamente y el detalle adopta un patrón master-detail con listado y ficha de scroll independiente.

## Ejecutar rápidamente

Requisitos: Node.js 22+ y pnpm 10+.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://localhost:5173`.

## Tecnologías utilizadas

| Tecnología                               | Elección                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Vue 3, TypeScript, Vite y Vue Router     | Componentes reactivos, contratos estrictos, build rápido y navegación con guard de onboarding. |
| Pinia                                    | Estado de catálogo, favoritos y preferencias; persistencia local versionada sin backend.       |
| Tailwind CSS v4 + shadcn-vue             | Tokens semánticos y primitives propios; CVA y Reka UI modelan variantes y estados.             |
| PokeAPI GraphQL + REST + Zod             | Consultas remotas eficientes, detalle completo y validación de toda respuesta externa.         |
| TanStack Vue Virtual                     | Solo monta las filas visibles del catálogo.                                                    |
| Vitest, Vue Test Utils, Playwright y axe | Unit tests, flujos E2E, accesibilidad y regresión visual en cuatro viewports.                  |
| GitHub Actions                           | Formato, lint, tipos, cobertura, build y E2E como quality gate reproducible.                   |

## Decisiones técnicas y de producto

### Datos preparados para escala

El endpoint REST de listado no permite búsqueda parcial ni filtro por tipo en servidor. Descargar el índice completo y filtrarlo en el navegador habría funcionado para una demo, pero no para el criterio del PDF sobre gran cantidad de datos. Por eso:

- GraphQL consulta páginas de 40 con `limit`, `offset`, búsqueda por nombre/ID y tipos directamente en PokeAPI.
- Infinite scroll solicita la siguiente página cerca del final y TanStack Virtual renderiza solo las filas visibles.
- Los sprites de las cards se derivan del ID recibido; no se hace una petición de detalle por tarjeta.
- REST se reserva para la ficha abierta. Los favoritos se rehidratan por GraphQL en lotes de hasta 100, evitando N+1.
- Caché TTL de 30 minutos, deduplicación de solicitudes en vuelo y versionado de búsquedas evitan trabajo repetido y respuestas obsoletas.

### Fronteras claras

`PokemonRepository` encapsula GraphQL/REST, caché y composición de endpoints. Zod valida las respuestas antes de convertirlas en modelos de dominio normalizados; las vistas nunca dependen del JSON crudo de PokeAPI. Pinia coordina estado e interacción, pero no contiene lógica HTTP. Esto aplica responsabilidad única y DRY sin añadir una capa genérica de casos de uso que, para este alcance, violaría KISS.

```text
PokeAPI → Zod + Repository → Pinia → Views → primitives shadcn + tokens Tailwind
```

### Sistema de diseño antes que estilos aislados

Figma define composición, tipografía, colores y estados; PokeAPI prevalece cuando el contenido de muestra contradice datos reales. Los tokens viven en `src/styles/main.css` y se exponen a Tailwind. Todo control interactivo atraviesa componentes propios basados en shadcn-vue (`Button`, `SearchField`, `Checkbox`, `Sheet`, `Card`, `Badge`, `Link`, `Sonner`); ESLint impide introducir controles nativos fuera de esa capa.

La adaptación web no estira el frame mobile: el catálogo llega hasta cinco columnas dentro de un máximo de lectura, mientras el detalle desktop mantiene un listado de 420 px y una composición centrada. Mobile conserva navegación fija, sheets táctiles y el sprite animado Black/White de Figma; desktop usa official artwork para aprovechar su escala.

### Funcionalidad sin ampliar el alcance artificialmente

- Favoritos y onboarding se persisten en `localStorage` mediante stores versionados; no se añadió backend ni base de datos porque el PDF los excluye.
- Compartir usa Clipboard API y copia nombre y atributos separados por comas. Se ubica en desktop para respetar el frame mobile.
- La Pokébola de carga es CSS y responde a `prefers-reduced-motion`.
- Error/reintento, resultados vacíos, favoritos vacíos, undo y rutas protegidas tienen estados explícitos.
- No se inventó autenticación, dark mode o contenido para Regiones/Perfil sin respaldo en los requisitos.

## Calidad y documentación

```bash
pnpm check      # formato, ESLint, tipos, 63 unit tests, cobertura y build
pnpm test:e2e   # flujos, axe y screenshots en 360, 768, 1440 y 1920 px
```

La cobertura actual alcanza 100% de líneas/funciones y 92,45% de ramas en dominio y stores. Playwright usa fixtures deterministas únicamente en tests; producción siempre consume PokeAPI real.

Documentación ampliada: [arquitectura](docs/architecture.md), [decisiones e inconsistencias](docs/decisions.md), [sistema de diseño](docs/design-system.md), [trazabilidad](docs/requirements.md) y [checklist UI](docs/ui-quality-checklist.md).

Pokémon, PokeAPI y sus assets pertenecen a sus respectivos propietarios y se utilizan únicamente para esta prueba técnica.
