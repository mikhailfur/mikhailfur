<template>
  <section id="projects" class="py-20 px-6 pt-24">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Мои проекты</h2>
        <p class="text-gray-400 text-lg">Работы, которыми я горжусь</p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="project in projects"
          :key="project.id"
          :class="`group bg-gray-900/50 rounded-2xl p-8 border border-gray-800 ${projectBorderColors[project.id] || 'hover:border-blue-500/50'} transition-all duration-300 hover:transform hover:scale-105`"
        >
          <div class="mb-6">
            <div :class="`w-12 h-12 bg-gradient-to-r ${project.gradient} rounded-xl flex items-center justify-center mb-4`">
              <i :class="`${project.icon} text-white text-xl`"></i>
            </div>
            <h3 class="text-2xl font-bold mb-2">{{ project.title }}</h3>
            <p class="text-gray-400 mb-4">{{ project.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="(tag, index) in project.tags"
              :key="index"
              class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flex gap-4">
            <a :href="project.link" target="_blank" :class="`${projectLinkColors[project.id] || 'text-blue-400 hover:text-blue-300'} transition-colors`">
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
</script>

