# Arquitectura

La aplicación separa integración, dominio, estado y presentación para que PokeAPI pueda evolucionar sin filtrar su contrato HTTP hacia las vistas.

```text
PokeAPI GraphQL (catálogo) + REST (detalle)
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
- `src/stores`: páginas remotas de catálogo, favoritos con undo y preferencias persistidas.
- `src/components/ui`: primitives centralizados siguiendo la convención shadcn-vue; CVA define variants y todos consumen tokens.
- `src/components/{catalog,pokemon,favorites,states}`: componentes de feature sin conocimiento del formato crudo de PokeAPI.
- `src/views`: composición de rutas y adaptación responsive.

## Estrategia para gran volumen

El listado actual de PokeAPI supera los mil registros. El catálogo consulta GraphQL v1beta2 en páginas de 40 con `limit` y `offset`; el mismo `where` resuelve en servidor la búsqueda parcial por nombre, el ID exacto y la unión de tipos. Cada página devuelve únicamente ID, nombre y tipos. Las URLs oficiales de sprite y artwork se derivan del ID, por lo que una página completa requiere una sola solicitud y no un detalle REST por card.

El infinite scroll pide la siguiente página cerca del final y la lista solo monta las filas visibles. Un cambio de búsqueda o filtros invalida resultados tardíos mediante una versión de solicitud. El repositorio deduplica solicitudes concurrentes y conserva cada combinación de consulta y variables durante 30 minutos. REST queda reservado para la ficha completa y la hidratación puntual de favoritos.

## Responsive

- `360×800`: réplica de los frames fuente y navegación inferior.
- `768×1024`: catálogo virtualizado en dos columnas y navegación inferior.
- `≥1024 px`: shell al 100% del viewport y rail de 104 px. La ruta de catálogo ocupa todo el ancho útil con una grilla adaptativa de hasta cinco columnas. Cuando existe una ficha seleccionada, el catálogo conserva 420 px y activa el detalle master-detail; la ficha limita sus bloques de lectura a 896 px para no escalar desproporcionadamente el contenido.

## Persistencia

Solo `favorites` y `preferences` se almacenan en `localStorage`. El payload incorpora una versión para permitir migraciones o invalidar datos incompatibles. No existe backend ni base de datos.
