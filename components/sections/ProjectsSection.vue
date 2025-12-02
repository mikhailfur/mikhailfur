<template>
  <section id="projects" class="py-20 px-6 pt-24 relative">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Мои проекты</h2>
        <p class="text-gray-300/80 text-lg">Список проектов из моего портфолио</p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="project in projects"
          :key="project.id"
          :class="`group glass-card p-8 relative ${projectBorderColors[project.id] || 'hover:border-blue-400/40'}`"
        >
          <div class="mb-6">
            <div :class="`w-14 h-14 bg-gradient-to-r ${project.gradient} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-soft`">
              <i :class="`${project.icon} text-white text-xl transition-transform duration-500 group-hover:scale-125`"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2 text-white">{{ project.title }}</h3>
            <p class="text-gray-300/80 mb-4">{{ project.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="(tag, index) in project.tags"
              :key="index"
              class="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-blue-300 rounded-2xl text-sm border border-white/10 transition-all duration-300 hover:bg-white/20 hover:scale-105"
              :style="`transition-delay: ${index * 50}ms`"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex gap-4">
            <a :href="project.link" target="_blank" :class="`${projectLinkColors[project.id] || 'text-blue-300 hover:text-blue-200'} transition-colors font-medium`">
              <i class="fas fa-external-link-alt mr-2"></i>
              {{ project.id === 'comic' ? 'Читать' : 'Перейти' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { projects, projectBorderColors, projectLinkColors } from '~/utils/constants'

const { initLiquidGlass } = useLiquidGlass()

onMounted(() => {
  if (import.meta.client) {
    initLiquidGlass('.glass-card')
  }
})
</script>

