<script setup lang="ts">
import { ChevronLeft, RotateCcw } from '@lucide/vue'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/ui/sonner'
import ContentContainer from '@/components/layout/ContentContainer.vue'
import FavoriteListItem from '@/components/favorites/FavoriteListItem.vue'
import PokemonCardSkeleton from '@/components/pokemon/PokemonCardSkeleton.vue'
import EmptyState from '@/components/states/EmptyState.vue'
import { Button } from '@/components/ui/button'
import { useCatalogStore } from '@/stores/catalog'
import { useFavoritesStore } from '@/stores/favorites'
import { usePokemonGridColumns } from '@/composables/usePokemonGridColumns'

const router = useRouter()
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
  <section class="min-h-[calc(100dvh-77px)] bg-background lg:min-h-dvh">
    <ContentContainer
      v-if="favorites.count"
      as="header"
      class="relative h-[102px] px-4 lg:h-auto lg:px-6 lg:pb-5 lg:pt-8"
    >
      <Button
        variant="icon"
        size="icon"
        class="absolute left-3 top-7 lg:hidden"
        aria-label="Volver a la Pokédex"
        @click="router.push('/pokedex')"
      >
        <ChevronLeft class="size-6" />
      </Button>
      <h1 class="pt-[38px] text-center text-base font-semibold lg:pt-0 lg:text-left lg:text-[26px]">
        Favoritos
      </h1>
      <p class="mt-1 hidden text-sm text-[var(--text-secondary)] lg:block">
        {{ favorites.count }} {{ favorites.count === 1 ? 'Pokémon guardado' : 'Pokémon guardados' }}
      </p>
    </ContentContainer>

    <Transition name="state-fade" mode="out-in">
      <EmptyState v-if="favorites.count === 0" key="empty" />
      <ContentContainer v-else key="favorites" class="px-4 pb-8 lg:px-6">
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
