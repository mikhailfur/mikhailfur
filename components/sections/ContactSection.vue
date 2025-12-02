<template>
  <section id="contact" class="py-20 px-6 pt-24 relative">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Контакты</h2>
      <p class="text-xl text-gray-200/90 mb-12">Мои ссылки на соц. сети</p>
      
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <a
          v-for="contact in contacts"
          :key="contact.type"
          :href="contact.link"
          :target="contact.type !== 'email' ? '_blank' : undefined"
          class="glass-card p-6 hover:border-blue-400/40 transition-all duration-500 cursor-pointer group hover:transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-glow-blue"
        >
          <i :class="`${contact.icon} text-3xl text-blue-300 mb-4 group-hover:text-blue-200 transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`"></i>
          <h3 class="text-xl font-bold mb-2 text-white group-hover:text-blue-200 transition-colors">{{ contact.label }}</h3>
          <p class="text-gray-300/80 group-hover:text-gray-200 transition-colors">{{ contact.value }}</p>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { contacts } from '~/utils/constants'

const { initLiquidGlass } = useLiquidGlass()

onMounted(() => {
  if (import.meta.client) {
    initLiquidGlass('.glass-card')
  }
})
</script>

