<script setup lang="ts">
import { Heart } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  favorite: boolean
  subject?: string
}>()
defineEmits<{ toggle: [] }>()

const actionLabel = computed(() => {
  const action = props.favorite ? 'Quitar' : 'Agregar'
  return props.subject
    ? `${action} a ${props.subject} ${props.favorite ? 'de' : 'a'} favoritos`
    : `${action} ${props.favorite ? 'de' : 'a'} favoritos`
})
</script>

<template>
  <Button
    variant="icon"
    size="icon-sm"
    class="size-9 rounded-full border-2 border-white bg-black/15 text-white hover:bg-black/25"
    :aria-label="actionLabel"
    :aria-pressed="favorite"
    data-slot="favorite-button"
    @click="$emit('toggle')"
  >
    <Transition name="heart-pop" mode="out-in">
      <Heart
        :key="favorite ? 'favorite' : 'available'"
        class="size-6"
        :class="favorite ? 'fill-[var(--favorite)] text-[var(--favorite)]' : 'text-white'"
        aria-hidden="true"
      />
    </Transition>
  </Button>
</template>
