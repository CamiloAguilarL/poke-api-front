# Arquitectura

La aplicación separa integración, dominio, estado y presentación para que PokeAPI pueda evolucionar sin filtrar su contrato HTTP hacia las vistas.

```text
PokeAPI
  ↓ validación Zod + caché + deduplicación
PokemonRepository
  ↓ modelos normalizados y localizados
Pinia (catalog, favorites, preferences)
  ↓ estado reactivo y persistencia versionada
Views / feature components
  ↓
shadcn-style UI primitives + Tailwind semantic tokens
```

## Responsabilidades

- `src/features/pokemon/api`: schemas de borde, errores de red, caché TTL, peticiones en vuelo y composición de endpoints.
- `src/features/pokemon/domain`: tipos independientes de Vue, metadatos visuales y formatters deterministas.
- `src/stores`: búsqueda/filtro, favoritos con undo y preferencias persistidas.
- `src/components/ui`: primitives centralizados siguiendo la convención shadcn-vue; CVA define variants y todos consumen tokens.
- `src/components/{catalog,pokemon,favorites,states}`: componentes de feature sin conocimiento del formato crudo de PokeAPI.
- `src/views`: composición de rutas y adaptación responsive.

## Estrategia para gran volumen

El listado actual de PokeAPI supera los mil registros. El cliente obtiene primero solo `name/url`, calcula el ID desde la URL y virtualiza las filas. Únicamente hidrata los summaries visibles, con seis workers como máximo. El repositorio deduplica solicitudes concurrentes, mantiene caché con TTL y comparte respuestas entre catálogo, detalle, favoritos y evoluciones.

Los filtros por tipo se resuelven en paralelo con `/type/{type}` y combinan una unión de nombres; la búsqueda local se aplica encima. Así se evita descargar el detalle completo de toda la Pokédex.

## Responsive

- `360×800`: réplica de los frames fuente y navegación inferior.
- `768×1024`: catálogo virtualizado en dos columnas y navegación inferior.
- `≥1024 px`: shell al 100% del viewport y rail de 104 px. La ruta de catálogo ocupa todo el ancho útil con una grilla adaptativa de hasta cinco columnas. Cuando existe una ficha seleccionada, el catálogo conserva 420 px y activa el detalle master-detail; la ficha limita sus bloques de lectura a 896 px para no escalar desproporcionadamente el contenido.

## Persistencia

Solo `favorites` y `preferences` se almacenan en `localStorage`. El payload incorpora una versión para permitir migraciones o invalidar datos incompatibles. No existe backend ni base de datos.
