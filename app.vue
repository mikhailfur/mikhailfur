<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'ru'
  }
})

// Console warning
if (import.meta.client) {
  console.log(
    '%cВНИМАНИЕ!',
    'color: white; background: red; font-size: 48px; font-weight: bold; padding: 10px;'
  )
  console.log(
    '%cСюда нельзя ничего вставлять!\nЭто может привести к краже ваших данных (куки, пароли, сессии).',
    'color: red; font-size: 20px; font-weight: bold;'
  )
  console.log(
    '%cЕсли вам кто-то сказал что нужно вставить сюда код — это обманщики.',
    'color: orange; font-size: 16px;'
  )
}
</script>

