<template>
  <div>
    <UiNavigation />
    
    <!-- Hero Section -->
    <section class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-purple-900/20"></div>
      <div class="absolute inset-0">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      </div>
      
      <div class="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div class="animate-fade-in">
          <div class="mb-6">
            <h1 class="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent">
              Политика конфиденциальности
            </h1>
            <div class="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light">
              Защита ваших персональных данных
            </div>
          </div>
          <p class="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up max-w-3xl mx-auto leading-relaxed">
            Мы серьезно относимся к защите вашей конфиденциальности и персональных данных
          </p>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto">
        <div class="space-y-8 sm:space-y-10 md:space-y-12">
          <!-- Introduction -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-shield-alt text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1. Общие положения</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей сервисов MikhailFur Technology, включая ИИ-ассистента в Telegram.</p>
              <p>Мы обязуемся защищать вашу конфиденциальность и обеспечивать безопасность ваших персональных данных в соответствии с действующим законодательством.</p>
              <p>Используя наши сервисы, включая Telegram-бота с ИИ-ассистентом, вы соглашаетесь с условиями настоящей Политики конфиденциальности.</p>
            </div>
          </div>

          <!-- Data Collection -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-database text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">2. Собираемые данные</h2>
            </div>
            <div class="space-y-4 sm:space-y-6">
              <p class="text-gray-300 text-sm sm:text-base">Мы можем собирать следующие типы персональных данных:</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/20 interactive-element">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-user text-blue-400 mr-2"></i>
                    <h3 class="font-semibold">Контактная информация</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">Имя, email, телефон, Telegram ID</p>
                </div>
                
                <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-500/20 interactive-element">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-robot text-green-400 mr-2"></i>
                    <h3 class="font-semibold">Данные переписки</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">Сообщения с ИИ-ассистентом в Telegram</p>
                </div>
                
                <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/20 interactive-element">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-credit-card text-purple-400 mr-2"></i>
                    <h3 class="font-semibold">Платежные данные</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">Данные для автосписания по подписке</p>
                </div>
                
                <div class="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-500/20 interactive-element">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-globe text-orange-400 mr-2"></i>
                    <h3 class="font-semibold">Технические данные</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">IP-адрес, браузер, устройство</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Usage -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-cogs text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3. Использование данных</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Мы используем собранные данные для следующих целей:</p>
              <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                <li>Предоставления и улучшения наших сервисов</li>
                <li>Обработки запросов и обращений</li>
                <li>Анализа использования сайта и сервисов</li>
                <li>Отправки важных уведомлений</li>
                <li>Соблюдения правовых обязательств</li>
              </ul>
            </div>
          </div>

          <!-- Data Storage -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-server text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">4. Хранение данных переписки</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>В Telegram-боте с ИИ-ассистентом мы собираем и храним следующую информацию:</p>
              
              <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-500/20">
                <div class="flex items-center mb-3">
                  <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                  <h3 class="font-semibold text-blue-400">Что собирается</h3>
                </div>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• Ваши сообщения к ИИ-ассистенту</li>
                  <li>• Ответы ИИ-ассистента на ваши запросы</li>
                  <li>• Время и дата переписки</li>
                  <li>• Telegram ID пользователя</li>
                </ul>
              </div>
              
              <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-500/20">
                <div class="flex items-center mb-3">
                  <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                  <h3 class="font-semibold text-green-400">Безопасность хранения</h3>
                </div>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• Данные хранятся на защищенных серверах</li>
                  <li>• Используется шифрование при передаче и хранении</li>
                  <li>• Доступ к данным имеют только авторизованные сотрудники</li>
                  <li>• Данные не передаются третьим лицам</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Data Protection -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-lock text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">5. Защита данных</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Мы применяем следующие меры защиты ваших данных:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 class="font-semibold text-green-400 mb-2 text-sm sm:text-base">Технические меры</h3>
                  <ul class="text-xs sm:text-sm space-y-1">
                    <li>• SSL-шифрование</li>
                    <li>• Безопасные серверы</li>
                    <li>• Регулярные обновления</li>
                  </ul>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <h3 class="font-semibold text-blue-400 mb-2 text-sm sm:text-base">Организационные меры</h3>
                  <ul class="text-xs sm:text-sm space-y-1">
                    <li>• Ограниченный доступ</li>
                    <li>• Обучение персонала</li>
                    <li>• Политики безопасности</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- User Rights -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-user-shield text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">6. Ваши права</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Вы имеете следующие права в отношении ваших персональных данных:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-500/20">
                  <h3 class="font-semibold text-blue-400 mb-2 text-sm sm:text-base">Право на доступ</h3>
                  <p class="text-xs sm:text-sm">Получить информацию о ваших данных</p>
                </div>
                <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-500/20">
                  <h3 class="font-semibold text-green-400 mb-2 text-sm sm:text-base">Право на исправление</h3>
                  <p class="text-xs sm:text-sm">Исправить неточные данные</p>
                </div>
                <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/20">
                  <h3 class="font-semibold text-purple-400 mb-2 text-sm sm:text-base">Право на удаление</h3>
                  <p class="text-xs sm:text-sm">Удалить ваши данные</p>
                </div>
                <div class="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-orange-500/20">
                  <h3 class="font-semibold text-orange-400 mb-2 text-sm sm:text-base">Право на ограничение</h3>
                  <p class="text-xs sm:text-sm">Ограничить обработку данных</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-envelope text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">7. Контактная информация</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>По вопросам обработки персональных данных обращайтесь:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-envelope text-blue-400 mr-2"></i>
                  <span>Email: me@mikhailfur.ru</span>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-link text-blue-400 mr-2"></i>
                  <span>Сайт: mikhailfur.ru</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="section-fade text-center text-gray-400 py-6 sm:py-8">
            <p class="text-sm sm:text-base">Политика конфиденциальности вступает в силу с момента публикации</p>
            <p class="mt-2 text-xs sm:text-sm">Последнее обновление: 6 сентября 2025 года</p>
            <p class="mt-2 text-xs text-gray-500">MikhailFur Technology | Политика конфиденциальности для ИИ-ассистента</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Back to Home -->
    <section class="py-8 sm:py-12 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto text-center">
        <NuxtLink to="/" class="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-medium hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
          <i class="fas fa-arrow-left mr-2"></i>
          Вернуться на главную
        </NuxtLink>
      </div>
    </section>

    <UiFooter />
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'

onMounted(() => {
  if (import.meta.client) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, observerOptions)

    document.querySelectorAll('.section-fade').forEach(section => {
      observer.observe(section)
    })

    // Add interactive effects to data cards
    document.querySelectorAll('.interactive-element').forEach(element => {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, { scale: 1.02, duration: 0.3, ease: 'power1.out' })
      })
      element.addEventListener('mouseleave', () => {
        gsap.to(element, { scale: 1, duration: 0.3, ease: 'power1.out' })
      })
    })
  }
})

useHead({
  title: 'Политика конфиденциальности - MikhailFur'
})
</script>

<style scoped>
.section-fade {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.section-fade.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
