<script setup lang="ts">
withDefaults(defineProps<{ label?: string; fullscreen?: boolean }>(), {
  label: 'Cargando Pokémon',
  fullscreen: false,
})
</script>

<template>
  <div
    :class="[
      'flex items-center justify-center bg-background',
      fullscreen ? 'min-h-dvh' : 'min-h-[340px]',
    ]"
    role="status"
    :aria-label="label"
  >
    <div class="flex flex-col items-center gap-5">
      <div class="pokeball" aria-hidden="true"><span /></div>
      <p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
    </div>
  </div>
</template>

<style scoped>
.pokeball {
  position: relative;
  width: 84px;
  height: 84px;
  overflow: hidden;
  border: 5px solid #212121;
  border-radius: 50%;
  background: linear-gradient(to bottom, #ef5350 0 46%, #212121 46% 54%, white 54% 100%);
  box-shadow: 0 10px 28px rgb(13 71 161 / 18%);
  animation: catch 1.1s ease-in-out infinite;
}

.pokeball::before {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  border: 5px solid #212121;
  border-radius: 50%;
  background: white;
  content: '';
  transform: translate(-50%, -50%);
}

.pokeball span {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
  transform: translate(-50%, -50%);
}

@keyframes catch {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  35% {
    transform: rotate(-18deg) translateY(-4px);
  }
  70% {
    transform: rotate(18deg) translateY(-4px);
  }
}
</style>
