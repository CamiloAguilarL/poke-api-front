# Decisiones e inconsistencias resueltas

## Precedencia de fuentes

1. Condiciones explícitas de la prueba y del candidato.
2. Draft editable más reciente de Figma.
3. PDF de la prueba.
4. Mock data visual solo como composición, nunca como fuente de contenido productivo.

## Datos reales frente al mockup

Algunas cards de Figma asignan IDs o tipos incorrectos a especies concretas. La interfaz conserva el layout, pero nombre, ID, sprites, tipos, descripción, medidas, categoría, habilidades, género, debilidades y evoluciones proceden de PokeAPI.

El PDF cita únicamente `/pokemon` y `/pokemon/{name}`. El detalle diseñado necesita información que esos recursos no contienen, por lo que se agregaron `/pokemon-species`, `/ability`, `/type` y `/evolution-chain`. No se inventan fallbacks de negocio; cuando la API falla aparece el estado de error y reintento.

## Compartir

Figma no incluye la acción, pero el PDF la exige. Se añadió junto al favorito en el hero y como CTA al final. Clipboard copia todos los atributos visibles en segmentos separados por coma; las comas internas de la descripción se normalizan a punto y coma para que el contrato sea inequívoco.

## Onboarding y autenticación

El segundo frame dice “Regístrate”, pero no existe flujo de autenticación en el PDF ni diseños asociados. El texto se conserva pixel-perfect; completar onboarding solo persiste una preferencia local. No se introdujo un registro ficticio.

## Desktop

El correo pide adaptar una propuesta mobile a web sin aportar frames desktop. Se eligió master-detail: shell a ancho completo, rail estable, catálogo virtualizado de 420 px y ficha simultánea con bloques de lectura de máximo 896 px. Esta extensión elimina gutters laterales artificiales, conserva el lenguaje visual y evita estirar una card mobile a todo el viewport.

## Extensiones controladas

- Evoluciones con navegación entre fichas.
- Persistencia versionada de favoritos.
- Swipe-to-delete con alternativa de botón y undo.
- Localización española con fallback inglés.
- Regresión visual, axe, cobertura y CI.

No se añadieron autenticación, backend, base de datos, dark mode ni despliegue porque ampliarían el alcance sin evidencia de producto.
