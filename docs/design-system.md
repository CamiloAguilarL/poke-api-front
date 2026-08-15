# Sistema de diseño

## Fuente de verdad

Los valores se extrajeron del draft editable de Figma. `src/styles/main.css` publica tokens semánticos y `@theme inline` los expone a Tailwind; las vistas no definen una segunda paleta.

| Grupo        | Tokens principales                                                         |
| ------------ | -------------------------------------------------------------------------- |
| Superficie   | `--surface-default`, `--surface-card`, `--surface-info`, `--surface-panel` |
| Texto        | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse`  |
| Acción       | `--action-primary`, `--action-primary-hover`, `--action-primary-pressed`   |
| Estado       | `--navigation-active`, `--favorite`, `--danger`, `--gender-*`              |
| Tipo Pokémon | `--type-normal` … `--type-fairy`                                           |
| Forma/sombra | radios Tailwind `sm/md/lg/xl`; `--shadow-card`, `--shadow-sprite`          |

La tipografía renderizada en los frames es Poppins. Los residuos de Montserrat presentes en algunos styles internos de Figma no se propagan a producción.

## Primitives

- `Button`: CVA para `primary`, `secondary`, `tertiary`, `icon` y `danger`, tamaños táctiles y loading accesible.
- `Input`, `Label` y `SearchField`: composición de campo accesible, foco y acción clear única.
- `Checkbox`: primitive Reka UI con estados checked/unchecked, usado por los filtros de tipo.
- `Toggle`: primitive Reka UI disponible para controles binarios futuros y cubierto por pruebas unitarias.
- `Link`: única frontera sobre Vue Router, con variantes de navegación y cards.
- `Sheet`: composición accesible de Reka UI para el bottom sheet mobile y diálogo centrado en desktop.
- `SkipLink`: atajo de teclado centralizado hacia el contenido principal.
- `Card`, `Badge` y `Skeleton`: superficies, tipos y loading sin repetir estilos de base.
- `Sonner`: frontera centralizada para toasts y su viewport.

`components.json` conserva la configuración shadcn-vue y los aliases. Los componentes viven en el repositorio —la práctica estándar de shadcn— para poder adaptarlos a los tokens del ejercicio.

## Regla de adopción

Las vistas y los componentes de feature pueden usar HTML semántico de contenido y layout (`main`, `section`, encabezados, listas), pero no crean controles HTML interactivos. ESLint bloquea `button`, `input`, `select`, `textarea`, `a` y `label`, además de imports directos de `RouterLink` y `vue-sonner`, fuera de `src/components/ui`. De esta manera todo estado, foco, variante y token atraviesa una capa propia sin sacrificar semántica ni accesibilidad.

## Accesibilidad

La geometría y la paleta base se mantienen. Las acciones terciarias pequeñas usan el azul de navegación, más oscuro. La suite axe bloquea violaciones `critical` o `serious`, salvo la excepción documentada de contraste en chips cuyo texto blanco es parte explícita de Figma; los targets táctiles principales miden al menos 44 px y `prefers-reduced-motion` reduce animaciones.
