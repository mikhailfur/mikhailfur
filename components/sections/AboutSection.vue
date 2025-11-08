<template>
  <section id="about" class="py-20 px-6 pt-24">
    <div class="max-w-6xl mx-auto">
      <div class="relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-3xl p-12 border border-gray-700/50 overflow-hidden">
        <div class="absolute inset-0">
          <div class="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        <div class="relative z-10">
          <div class="text-center mb-12">
            <h2 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">О себе</h2>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div class="text-left">
              <p class="text-lg text-gray-300 mb-6">
                Я разработчик с страстью к созданию инновационных проектов. 
                Специализируюсь на веб-разработке, ИИ-технологиях и создании 
                пользовательских интерфейсов.
              </p>
              <p class="text-lg text-gray-300 mb-6">
                Помимо программирования, я увлекаюсь созданием ПО и 
                изучением новых технологий. Каждый проект для меня - это 
                возможность создать что-то уникальное и полезное.
              </p>
              <div class="flex flex-wrap gap-4">
                <span
                  v-for="(skill, index) in skills"
                  :key="index"
                  :class="`px-4 py-2 ${skill.bgGradient} rounded-full border ${skill.borderColor} transition-all duration-300 hover:scale-105`"
                >
                  <span :class="`bg-gradient-to-r ${skill.gradient} bg-clip-text text-transparent font-semibold`">
                    {{ skill.name }}
                  </span>
                </span>
              </div>
            </div>
            <div class="flex justify-center items-start h-full pt-4 pl-4">
              <div class="relative w-56 h-56 rounded-full shadow-2xl overflow-hidden border-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1">
                <div class="w-full h-full rounded-full overflow-hidden">
                  <img src="/src/avatar.jpg" alt="MikhailFur" class="w-full h-full object-cover rounded-full">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { skills } from '~/utils/constants'
</script>

