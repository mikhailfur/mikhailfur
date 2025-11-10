<template>
  <div>
    <UiNavigation />
    
    <!-- Hero Section -->
    <section id="home" class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div class="absolute inset-0">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <!-- 3D Background Canvas -->
      <canvas id="particles-canvas" class="absolute inset-0 w-full h-full"></canvas>
      
      <!-- Floating Icons -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-20 left-10 text-blue-400/30 animate-bounce-slow">
          <i class="fab fa-js-square text-4xl"></i>
        </div>
        <div class="absolute top-32 right-16 text-green-400/30 animate-bounce-slow" style="animation-delay: -1s;">
          <i class="fab fa-python text-3xl"></i>
        </div>
        <div class="absolute bottom-40 left-20 text-purple-400/30 animate-bounce-slow" style="animation-delay: -2s;">
          <i class="fab fa-react text-3xl"></i>
        </div>
        <div class="absolute bottom-20 right-10 text-orange-400/30 animate-bounce-slow" style="animation-delay: -3s;">
          <i class="fab fa-node-js text-3xl"></i>
        </div>
        <div class="absolute top-1/2 left-8 text-pink-400/30 animate-spin-slow">
          <i class="fas fa-code text-2xl"></i>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div class="animate-fade-in">
          <!-- Animated Title with Typewriter Effect -->
          <div class="mb-6">
            <h1 class="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Привет мир!
            </h1>
            <div class="text-2xl md:text-3xl text-gray-300 font-light">
              Я <span id="typed-text" class="text-blue-400 font-semibold"></span>
            </div>
          </div>
          
          <!-- Animated Description -->
          <p class="text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up max-w-3xl mx-auto leading-relaxed">
            Создаю инновационные веб-приложения и изучаю новые технологии
          </p>
          
          <!-- Interactive Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-slide-up">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div :class="`text-2xl font-bold text-${stat.color}`" :data-count="stat.value">0</div>
              <div class="text-sm text-gray-400">{{ stat.label }}</div>
            </div>
          </div>
          
          <!-- Interactive Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <NuxtLink to="#projects" class="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden hover:-translate-y-1">
              <span class="relative z-10 transition-transform duration-500 group-hover:scale-105">Мои проекты</span>
              <div class="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </NuxtLink>
            <NuxtLink to="#contact" class="group px-8 py-4 border-2 border-white/20 rounded-full font-medium hover:border-white/40 hover:bg-white/5 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 backdrop-blur-sm hover:shadow-xl hover:shadow-white/10">
              <span class="group-hover:text-white transition-colors duration-500">Связаться</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <SectionsProjectsSection />

    <!-- About Section -->
    <SectionsAboutSection />

    <!-- Contact Section -->
    <SectionsContactSection />

    <UiFooter />
  </div>
</template>

<script setup lang="ts">
import { stats, typedStrings } from '~/utils/constants'
import { animationConfig } from '~/utils/animations'

const { initParticles, animateCounters, initHeroAnimations, initScrollAnimations, cleanup } = useAnimations()

onMounted(() => {
  if (import.meta.client) {
    initParticles('particles-canvas')
    initHeroAnimations()
    initScrollAnimations()

    setTimeout(() => {
      animateCounters()
    }, animationConfig.counter.delay)

    // Typewriter effect
    let currentStringIndex = 0
    let currentCharIndex = 0
    let isDeleting = false
    const typedElement = document.getElementById('typed-text')
    
    if (typedElement) {
      const type = () => {
        const currentString = typedStrings[currentStringIndex]
        
        if (isDeleting) {
          typedElement.textContent = currentString.substring(0, currentCharIndex - 1)
          currentCharIndex--
        } else {
          typedElement.textContent = currentString.substring(0, currentCharIndex + 1)
          currentCharIndex++
        }

        let typeSpeed = isDeleting 
          ? animationConfig.typewriter.backSpeed 
          : animationConfig.typewriter.typeSpeed

        if (!isDeleting && currentCharIndex === currentString.length) {
          typeSpeed = animationConfig.typewriter.backDelay
          isDeleting = true
        } else if (isDeleting && currentCharIndex === 0) {
          isDeleting = false
          currentStringIndex = (currentStringIndex + 1) % typedStrings.length
          typeSpeed = 500
        }

        setTimeout(type, typeSpeed)
      }

      type()
    }

  }
})

onUnmounted(() => {
  cleanup()
})

useHead({
  title: 'MikhailFur Technology',
  meta: [
    { name: 'description', content: 'MikhailFur - Frontend Developer, Game Developer, UI/UX Designer' }
  ]
})
</script>

