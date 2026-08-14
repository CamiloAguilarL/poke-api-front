<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SkipLink } from '@/components/ui/skip-link'
import { Sonner } from '@/components/ui/sonner'
</script>

<template>
  <SkipLink />
  <RouterView />
  <Sonner />
</template>
