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
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-[var(--sheet-overlay)] data-[state=open]:animate-in"
      />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[24px] bg-background shadow-2xl outline-none md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]"
      >
        <div
          class="mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--drag-handle)] md:hidden"
          aria-hidden="true"
        />
        <div class="sr-only">
          <DialogTitle>{{ title }}</DialogTitle>
          <DialogDescription>{{ description ?? title }}</DialogDescription>
        </div>
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
