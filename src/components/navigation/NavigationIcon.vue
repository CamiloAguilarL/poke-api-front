<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ src: string; class?: string }>()
const maskStyle = computed(() => ({
  maskImage: `url("${props.src}")`,
  WebkitMaskImage: `url("${props.src}")`,
}))
</script>

<template>
  <span
    :class="
      cn(
        'inline-block size-6 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
        props.class,
      )
    "
    :style="maskStyle"
    aria-hidden="true"
  />
</template>
