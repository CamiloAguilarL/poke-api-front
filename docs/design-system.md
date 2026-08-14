# Sistema de diseño

## Fuente de verdad

Los valores se extrajeron del draft editable de Figma. `src/styles/main.css` publica tokens semánticos y `@theme inline` los expone a Tailwind; las vistas no definen una segunda paleta.

| Grupo        | Tokens principales                                                        |
| ------------ | ------------------------------------------------------------------------- |
| Superficie   | `--surface-default`, `--surface-subtle`, `--surface-canvas`               |
| Texto        | `--text-primary`, `--text-secondary`, `--text-disabled`, `--text-inverse` |
| Acción       | `--action-primary`, `--action-primary-hover`, `--action-primary-pressed`  |
| Navegación   | `--navigation-active`, `--favorite`, `--danger`                           |
| Tipo Pokémon | `--type-normal` … `--type-fairy`                                          |
| Forma        | radios Tailwind `sm/md/lg/xl` = `8/12/16/24 px`                           |

La tipografía renderizada en los frames es Poppins. Los residuos de Montserrat presentes en algunos styles internos de Figma no se propagan a producción.

## Primitives

- `Button`: CVA para `primary`, `secondary`, `tertiary`, `icon` y `danger`, tres tamaños y loading accesible.
- `Input`: atributos nativos, `v-model` y estilos de foco centralizados.
- `Sheet`: composición accesible de Reka UI para el bottom sheet mobile y diálogo centrado en desktop.
- `Skeleton`: loading progresivo de cards.

`components.json` conserva la configuración shadcn-vue y los aliases. Los componentes viven en el repositorio —la práctica estándar de shadcn— para poder adaptarlos a los tokens del ejercicio.

## Accesibilidad

La geometría y la paleta base se mantienen. En badges con fondos claros se usa texto negro para alcanzar contraste AA; las acciones terciarias pequeñas usan el azul de navegación, más oscuro. La suite axe bloquea violaciones `critical` o `serious`, los targets táctiles principales miden al menos 44 px y `prefers-reduced-motion` reduce animaciones.
