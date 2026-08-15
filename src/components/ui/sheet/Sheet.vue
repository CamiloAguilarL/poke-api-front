<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

defineProps<{
  open: boolean
  title: string
  description?: string
}>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

function preventAutoFocus(event: Event) {
  event.preventDefault()
}
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-[var(--sheet-overlay)]"
        data-slot="sheet-overlay"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 top-[153px] z-50 overscroll-contain overflow-hidden rounded-t-[24px] bg-background shadow-[var(--shadow-sheet)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:h-[614px] md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]"
        data-slot="sheet-content"
        @open-auto-focus="preventAutoFocus"
      >
        <div class="sr-only">
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogDescription>{{ description ?? title }}</DialogDescription>
        </div>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
