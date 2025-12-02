<template>
  <nav class="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-xl border-b border-white/20 transition-all duration-300" :class="{ 'bg-white/15': isScrolled }">
    <div class="max-w-6xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-bold text-white hover:text-blue-300 transition-colors">
          MikhailFur
        </NuxtLink>
        <div class="hidden md:flex space-x-8">
          <NuxtLink to="/#home" class="text-gray-200 hover:text-blue-300 transition-colors font-medium" @click="closeMobileMenu">
            Главная
          </NuxtLink>
          <NuxtLink to="/#projects" class="text-gray-200 hover:text-blue-300 transition-colors font-medium" @click="closeMobileMenu">
            Проекты
          </NuxtLink>
          <NuxtLink to="/#about" class="text-gray-200 hover:text-blue-300 transition-colors font-medium" @click="closeMobileMenu">
            О себе
          </NuxtLink>
          <NuxtLink to="/#contact" class="text-gray-200 hover:text-blue-300 transition-colors font-medium" @click="closeMobileMenu">
            Контакты
          </NuxtLink>
        </div>
        <button class="md:hidden text-white p-2 hover:bg-white/10 rounded-2xl transition-colors" @click="toggleMobileMenu" aria-label="Toggle menu">
          <i :class="isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'"></i>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="isMobileMenuOpen" class="md:hidden fixed top-16 left-0 right-0 bg-white/15 backdrop-blur-xl border-b border-white/20 p-6 z-40">
        <div class="flex flex-col space-y-4">
          <NuxtLink to="/#home" class="text-gray-200 hover:text-blue-300 transition-colors py-2 font-medium" @click="closeMobileMenu">
            Главная
          </NuxtLink>
          <NuxtLink to="/#projects" class="text-gray-200 hover:text-blue-300 transition-colors py-2 font-medium" @click="closeMobileMenu">
            Проекты
          </NuxtLink>
          <NuxtLink to="/#about" class="text-gray-200 hover:text-blue-300 transition-colors py-2 font-medium" @click="closeMobileMenu">
            О себе
          </NuxtLink>
          <NuxtLink to="/#contact" class="text-gray-200 hover:text-blue-300 transition-colors py-2 font-medium" @click="closeMobileMenu">
            Контакты
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleScroll = () => {
  if (import.meta.client) {
    isScrolled.value = window.scrollY > 50
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

