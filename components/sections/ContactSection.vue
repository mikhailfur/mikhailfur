<template>
  <section id="contact" class="py-20 px-6 pt-24">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Контакты</h2>
      <p class="text-xl text-gray-300 mb-12">Мои ссылки на соц. сети</p>
      
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <a
          v-for="contact in contacts"
          :key="contact.type"
          :href="contact.link"
          :target="contact.type !== 'email' ? '_blank' : undefined"
          class="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-500 cursor-pointer group hover:transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <i :class="`${contact.icon} text-3xl text-blue-400 mb-4 group-hover:text-blue-300 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`"></i>
          <h3 class="text-xl font-bold mb-2 group-hover:text-white transition-colors">{{ contact.label }}</h3>
          <p class="text-gray-400 group-hover:text-gray-300 transition-colors">{{ contact.value }}</p>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { contacts } from '~/utils/constants'
</script>

