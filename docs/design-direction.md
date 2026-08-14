# Dirección visual

## Sujeto y audiencia

La aplicación es una Pokédex de consulta y favoritos. Su presentación primaria es para el equipo técnico/reclutador de Global66; la experiencia final debe seguir sintiéndose como un producto real, no como una landing de portafolio.

## Sistema

- **Superficie:** Snow `#FAFAFA`.
- **Texto:** Ink `#121212`, Slate `#424242`.
- **Acción:** Poké Blue `#1E88E5`, hover `#1976D2`, pressed `#1565C0`.
- **Navegación:** Deep League Blue `#0D47A1`.
- **Tipos:** paleta semántica completa extraída de Figma; el color identifica información real, no decoración.
- **Tipografía:** Poppins Semibold para títulos, Medium/Regular para lectura y Bold para estados activos. Se conserva una sola familia porque el Figma la fija de forma dominante.

## Layout

Mobile conserva los frames originales:

```text
┌──────────────────────┐
│ búsqueda        filtro│
│ card de tipo          │
│ card de tipo          │
│ …                     │
├──────────────────────┤
│ Pokédex · … · Perfil  │
└──────────────────────┘
```

Desktop usa master-detail:

```text
┌────────┬──────────────────┬────────────────────────────┐
│ rail   │ búsqueda/lista   │ detalle desplazable        │
│        │ card             │ header cromático + datos   │
│        │ card             │                            │
└────────┴──────────────────┴────────────────────────────┘
```

## Firma visual

La pieza memorable es la card bicolor por tipo: información sobre un tinte translúcido y sprite sobre un panel saturado con una silueta tipográfica/elemental sobredimensionada. En desktop esta misma lógica escala al header del detalle. El resto de la interfaz se mantiene deliberadamente silencioso.

## Autocrítica

Se descartan gradientes genéricos, paneles “glass”, estadísticas decorativas y hero marketing. No pertenecen al flujo de consulta ni al Figma. La única expansión estética autorizada es convertir la navegación inferior en rail y el catálogo/detalle en columnas a partir de `lg`, conservando tokens, radios y densidad.
