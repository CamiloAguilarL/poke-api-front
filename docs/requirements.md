# Matriz de requisitos y trazabilidad

Última validación de fuentes: 2026-08-15.

## Precedencia

1. Decisiones explícitas del candidato/usuario.
2. Nuevo Figma editable compartido por correo.
3. Requisitos funcionales del PDF.
4. El Figma antiguo enlazado desde el PDF queda reemplazado como referencia visual.

La geometría y el sistema visual se reproducen desde el nuevo Figma. Los datos de muestra que contradicen PokeAPI se reemplazan por datos reales y la diferencia se documenta.

## Correo y solicitud

| ID      | Requisito                                                                      | Evidencia de aceptación                                                                                                                 |
| ------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| MAIL-01 | El diseño provisto está optimizado para mobile y debe adaptarse a desktop/web. | Mobile coincide con los frames de Figma; desktop usa catálogo expandido y shell master-detail a ancho completo, validado hasta 1920 px. |
| USER-01 | Vue, Pinia, Tailwind y shadcn-vue son obligatorios.                            | Primitives shadcn-vue sobre CVA/Reka y `components.json`; ESLint impide controles nativos fuera de `components/ui`.                     |
| USER-02 | Componentes basados en tokens del sistema de diseño.                           | Paleta, estados, superficies, bordes y sombras centralizados; vistas sin colores crudos.                                                |
| USER-03 | Implementación pixel perfect.                                                  | Regresión visual en viewports Figma y revisión manual.                                                                                  |
| USER-04 | Todos los datos visibles deben venir de PokeAPI; no inventar valores.          | Adaptadores API y fallbacks explícitos, sin fixtures productivas.                                                                       |
| USER-05 | Documentar inconsistencias y decisiones.                                       | README y `docs/decisions.md`.                                                                                                           |
| USER-06 | Entrega en GitHub, sin despliegue, con README y evidencia visual.              | Repositorio, CI, galería representativa y screenshots completos versionados en Playwright.                                              |

## PDF de la prueba

| ID     | Requisito                                               | Evidencia de aceptación                                                                                                        |
| ------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| PDF-01 | Aplicación creada con Vue.js.                           | Vue 3 + TypeScript + Vite.                                                                                                     |
| PDF-02 | Datos desde PokeAPI; catálogo y detalle son el núcleo.  | GraphQL oficial para catálogo paginado y REST `pokemon/{name}` para detalle.                                                   |
| PDF-03 | Loading con efecto CSS sobre Pokébola.                  | Splash y loader reducido por preferencia de movimiento.                                                                        |
| PDF-04 | Compartir copia nombre y atributos separados por comas. | Test de Clipboard API y payload determinista.                                                                                  |
| PDF-05 | Sin backend ni base de datos; favoritos en store.       | Pinia + persistencia versionada local.                                                                                         |
| PDF-06 | Repositorio compartible en GitHub.                      | Historial Git y workflow de CI.                                                                                                |
| PDF-07 | UI visual y técnicamente bien implementada.             | Sistema de diseño, accesibilidad y visual tests.                                                                               |
| PDF-08 | Buena arquitectura, KISS, DRY y SOLID.                  | Dominio normalizado y capas con responsabilidades concretas.                                                                   |
| PDF-09 | Unit tests como punto extra.                            | Vitest con cobertura.                                                                                                          |
| PDF-10 | README con tecnologías y decisiones.                    | README orientado al reclutador.                                                                                                |
| PDF-11 | Pensar en gran volumen de datos.                        | Páginas remotas de 40, infinite scroll, virtualización, caché, deduplicación e hidratación de favoritos en lotes de hasta 100. |

## Flujo extraído del nuevo Figma

| ID     | Pantalla/estado    | Nodo de Figma | Comportamiento requerido                                                                                        |
| ------ | ------------------ | ------------- | --------------------------------------------------------------------------------------------------------------- |
| FIG-01 | Splash             | `6:20`        | Pokébola centrada y animada durante carga real.                                                                 |
| FIG-02 | Onboarding 1       | `4:58`        | Continuar al segundo paso.                                                                                      |
| FIG-03 | Onboarding 2       | `4:76`        | Completar onboarding y abrir catálogo.                                                                          |
| FIG-04 | Catálogo           | `10:2805`     | Cards, búsqueda, favoritos y navegación.                                                                        |
| FIG-05 | Filtro             | `10:3486`     | Bottom sheet, selección múltiple, aplicar/cancelar.                                                             |
| FIG-06 | Resultado filtrado | `10:6670`     | Conteo y acción para borrar filtro.                                                                             |
| FIG-07 | Detalle            | `10:6948`     | Datos completos, favorito, navegación y debilidades; compartir se integra en desktop por requerimiento del PDF. |
| FIG-08 | Favoritos          | `10:3195`     | Lista persistida.                                                                                               |
| FIG-09 | Swipe delete       | `10:3346`     | Eliminación móvil y alternativa accesible.                                                                      |
| FIG-10 | Favoritos vacíos   | `10:3117`     | Empty state instructivo.                                                                                        |
| FIG-11 | Error de API       | `10:2945`     | Mensaje y reintento.                                                                                            |
| FIG-12 | Regiones/Perfil    | `28:891`      | Estado “Muy pronto disponible”.                                                                                 |

## Inconsistencias conocidas

- El PDF menciona solo catálogo y detalle, pero el nuevo Figma requiere `pokemon-species`, `type` y `ability`; se usan endpoints adicionales para evitar datos ficticios.
- Los mockups asignan IDs o tipos incorrectos a Charmander/Charmeleon y muestran conteos que no coinciden con las cards. PokeAPI prevalece.
- El placeholder mezcla portugués y español; la implementación usa “Buscar Pokémon...”.
- Los componentes contienen residuos de Montserrat, pero las pantallas renderizadas usan Poppins. Se normaliza en Poppins.
- El nuevo Figma mobile no muestra Compartir; se conserva exacto y la acción exigida por el PDF se expone junto al corazón en desktop.
- El onboarding menciona registro, pero no existe flujo ni requisito de autenticación. Perfil conserva el estado en construcción.
