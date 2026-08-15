<script setup lang="ts">
import { RotateCcw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { toast } from '@/components/ui/sonner'
import ContentContainer from '@/components/layout/ContentContainer.vue'
import SectionHeader from '@/components/layout/SectionHeader.vue'
import FavoriteListItem from '@/components/favorites/FavoriteListItem.vue'
import PokemonCardSkeleton from '@/components/pokemon/PokemonCardSkeleton.vue'
import EmptyState from '@/components/states/EmptyState.vue'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/stores/catalog'
import { useFavoritesStore } from '@/stores/favorites'
import { usePokemonGridColumns } from '@/composables/usePokemonGridColumns'

const favorites = useFavoritesStore()
const catalog = useCatalogStore()
const { summaries } = storeToRefs(catalog)
const gridElement = ref<HTMLElement | null>(null)
const columns = usePokemonGridColumns(gridElement)
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
  <section class="flex h-[calc(100dvh-77px)] flex-col bg-background lg:h-dvh">
    <SectionHeader
      title="Favoritos"
      :subtitle="`${favorites.count} ${favorites.count === 1 ? 'Pokémon guardado' : 'Pokémon guardados'}`"
    />

    <Transition name="state-fade" mode="out-in">
      <EmptyState
        v-if="favorites.count === 0"
        key="empty"
        class="!min-h-0 flex-1 !translate-y-0"
        heading-tag="h2"
      />
      <ContentContainer
        v-else
        key="favorites"
        class="min-h-0 flex-1 overflow-y-auto px-4 pb-8 lg:px-6"
      >
        <div ref="gridElement">
          <TransitionGroup
            name="favorite-list"
            tag="div"
            class="relative grid gap-3"
            data-testid="favorites-grid"
            :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }"
          >
            <div v-for="name in favorites.names" :key="name">
              <FavoriteListItem
                v-if="summaries[name]"
                :pokemon="summaries[name]!"
                @remove="remove(name)"
              />
              <PokemonCardSkeleton v-else role="status" :aria-label="`Cargando ${name}…`" />
            </div>
            <Button
              v-if="favorites.lastRemoved"
              key="undo-action"
              variant="tertiary"
              class="col-span-full mx-auto"
              @click="favorites.undoRemove()"
            >
              <RotateCcw class="size-4" /> Deshacer última eliminación
            </Button>
          </TransitionGroup>
        </div>
      </ContentContainer>
    </Transition>
  </section>
</template>
