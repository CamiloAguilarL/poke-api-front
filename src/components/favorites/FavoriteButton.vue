<script setup lang="ts">
import { Heart } from '@lucide/vue'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{
    favorite: boolean
    subject?: string
    appearance?: 'card' | 'hero' | 'toolbar'
  }>(),
  { appearance: 'card' },
)
defineEmits<{ toggle: [] }>()

const appearanceClasses = {
  card: 'size-9 rounded-full border-2 border-white bg-black/15 text-white hover:bg-black/25',
  hero: 'size-10 rounded-full border-0 !bg-transparent p-0 text-white shadow-none hover:!bg-transparent active:!bg-transparent',
  toolbar:
    'size-10 rounded-full border border-[var(--border-default)] bg-card text-[var(--text-icon)] shadow-sm hover:bg-muted',
} as const
const buttonClasses = computed(() => appearanceClasses[props.appearance])

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
    :class="buttonClasses"
    :aria-label="actionLabel"
    :aria-pressed="favorite"
    data-slot="favorite-button"
    @click="$emit('toggle')"
  >
    <Transition name="heart-pop" mode="out-in">
      <Heart
        :key="favorite ? 'favorite' : 'available'"
        class="size-6"
        :class="
          favorite
            ? 'fill-[var(--favorite)] text-[var(--favorite)]'
            : appearance === 'toolbar'
              ? 'text-[var(--text-icon)]'
              : 'text-white'
        "
        aria-hidden="true"
      />
    </Transition>
  </Button>
</template>
