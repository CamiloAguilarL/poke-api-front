<script setup lang="ts">
import { RotateCcw, Trash2 } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/ui/sonner'
import FavoriteListItem from '@/components/favorites/FavoriteListItem.vue'
import EmptyState from '@/components/states/EmptyState.vue'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/stores/catalog'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const favorites = useFavoritesStore()
const catalog = useCatalogStore()
const { summaries } = storeToRefs(catalog)
async function hydrate() {
  await catalog.ensureSummaries(favorites.names)
}

function remove(name: string) {
  if (!favorites.remove(name)) return
  toast('Favorito eliminado', {
    action: {
      label: 'Deshacer',
      onClick: () => favorites.undoRemove(),
    },
  })
}

watch(() => [...favorites.names], hydrate)
onMounted(hydrate)
</script>

<template>
  <section class="min-h-[calc(100dvh-77px)] bg-background lg:min-h-dvh">
    <header class="px-4 pb-5 pt-11 lg:px-8 lg:pt-8">
      <h1 class="text-[26px] font-semibold">Favoritos</h1>
      <p class="mt-1 tabular-nums text-sm text-muted-foreground">
        {{ favorites.count }} Pokémon guardados
      </p>
    </header>

    <EmptyState v-if="favorites.count === 0" @action="router.push('/pokedex')" />
    <div v-else class="mx-auto grid max-w-5xl gap-3 px-4 pb-8 md:grid-cols-2 lg:px-8">
      <div v-for="name in favorites.names" :key="name">
        <FavoriteListItem
          v-if="summaries[name]"
          :pokemon="summaries[name]!"
          @remove="remove(name)"
        />
        <div
          v-else
          class="flex h-[102px] animate-pulse items-center rounded-2xl bg-[var(--surface-skeleton-soft)] px-4"
        >
          <span class="text-xs text-muted-foreground">Cargando {{ name }}...</span>
        </div>
      </div>
      <p
        class="col-span-full mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground md:hidden"
      >
        <Trash2 class="size-4" /> Desliza una tarjeta a la izquierda para eliminarla.
      </p>
      <Button
        v-if="favorites.lastRemoved"
        variant="tertiary"
        class="col-span-full mx-auto"
        @click="favorites.undoRemove()"
      >
        <RotateCcw class="size-4" /> Deshacer última eliminación
      </Button>
    </div>
  </section>
</template>
