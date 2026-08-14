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
      <div :class="['pokeball', { 'pokeball--large': fullscreen }]" aria-hidden="true">
        <span />
      </div>
      <p :class="fullscreen ? 'sr-only' : 'text-sm font-medium text-muted-foreground'">
        {{ label }}
      </p>
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

.pokeball::after {
  position: absolute;
  top: 14px;
  right: 13px;
  width: 25px;
  height: 25px;
  border: 4px solid transparent;
  border-top-color: white;
  border-right-color: white;
  border-radius: 50%;
  content: '';
  transform: rotate(-18deg);
}

.pokeball span {
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  border: 3px solid #757575;
  border-radius: 50%;
  background: white;
  transform: translate(-50%, -50%);
}

.pokeball--large {
  width: 154px;
  height: 154px;
  border-width: 4px;
}

.pokeball--large::before {
  width: 54px;
  height: 54px;
  border-width: 4px;
}

.pokeball--large::after {
  top: 26px;
  right: 25px;
  width: 48px;
  height: 48px;
  border-width: 6px;
}

.pokeball--large span {
  width: 32px;
  height: 32px;
  border-width: 3px;
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
