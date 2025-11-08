<template>
  <div class="bg-black text-white overflow-hidden h-screen relative">
    <!-- Аудио элемент -->
    <audio ref="audioRef" preload="auto">
      <source src="/404/content/okak.mp3" type="audio/mpeg">
    </audio>
    
    <!-- Основной контент -->
    <div class="relative h-full">
      <!-- Номер ошибки 404 -->
      <div class="absolute top-1/2 left-1/2 font-black animate-slide-up text-[200px] sm:text-[300px] md:text-[500px] lg:text-[750px] xl:text-[750px]" style="transform: translate(-50%, 800px); font-family: 'Montserrat', sans-serif;">
        404
      </div>
      
      <!-- Текст об ошибке -->
      <div class="absolute top-8 sm:top-12 md:top-16 left-1/2 transform -translate-x-1/2 text-center z-10 px-4">
        <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-2 sm:mb-4" style="font-family: 'Montserrat', sans-serif;">Страница не найдена</h1>
        <p class="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6 md:mb-8">К сожалению, запрашиваемая страница не существует</p>
        <NuxtLink to="/" class="inline-block bg-white text-black px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors shadow-lg text-sm sm:text-base">
          Вернуться на главную
        </NuxtLink>
      </div>
      
      <!-- Изображение кота -->
      <div class="cat-container absolute bottom-0 w-full max-w-7xl mx-auto animate-slide-down">
        <img src="/404/content/cat.png" alt="cat" class="cat-image w-full h-auto object-cover max-h-[200px] sm:max-h-[300px] md:max-h-[400px] lg:max-h-none object-bottom">
        <h1 class="absolute bottom-8 sm:bottom-12 md:bottom-20 lg:bottom-36 left-1/2 transform -translate-x-1/2 font-black text-[18px] sm:text-[24px] md:text-[40px] lg:text-[70px] xl:text-[115px]" style="font-family: 'Montserrat', sans-serif;">
          ОКАК
        </h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const audioRef = ref<HTMLAudioElement | null>(null)

const preventScroll = (e: Event) => {
  e.preventDefault()
}

onMounted(() => {
  if (import.meta.client && audioRef.value) {
    audioRef.value.volume = 0.3
    
    const playAudio = () => {
      if (audioRef.value) {
        audioRef.value.play().catch(() => {
          // Если автовоспроизведение заблокировано, воспроизводим при первом клике
          const playOnClick = () => {
            if (audioRef.value) {
              audioRef.value.play()
            }
          }
          document.addEventListener('click', playOnClick, { once: true })
        })
      }
    }
    
    playAudio()

    // Запрет скроллинга
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('touchmove', preventScroll)
    document.removeEventListener('wheel', preventScroll)
  }
})

defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
})
</script>

<style scoped>
@keyframes slideUp {
  0% { transform: translate(-50%, 800px); }
  100% { transform: translate(-50%, -400px); }
}

@keyframes slideDown {
  0% { transform: translateY(50%); }
  100% { transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 1.5s ease forwards;
}

.animate-slide-down {
  animation: slideDown 1.5s ease forwards;
}

@media (max-width: 640px) {
  .cat-container {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: none !important;
  }
  
  .cat-image {
    object-position: bottom !important;
    height: 200px !important;
    object-fit: cover !important;
  }
  
  @keyframes slideUp {
    0% { transform: translate(-50%, 400px); }
    100% { transform: translate(-50%, -200px); }
  }
}

@media (max-width: 480px) {
  @keyframes slideUp {
    0% { transform: translate(-50%, 200px); }
    100% { transform: translate(-50%, -100px); }
  }
}
</style>

