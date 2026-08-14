<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
</script>

<template>
  <Card class="flex h-[102px] items-center gap-3 p-3">
    <Skeleton class="size-[78px] shrink-0 rounded-2xl" />
    <div class="min-w-0 flex-1 space-y-2">
      <Skeleton class="h-3 w-14" />
      <Skeleton class="h-5 w-28" />
      <Skeleton class="h-5 w-36" />
    </div>
    <Skeleton class="size-9 shrink-0 rounded-full" />
  </Card>
</template>
