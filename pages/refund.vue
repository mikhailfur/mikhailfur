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
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-green-100 to-blue-100 bg-clip-text text-transparent">
              Политика возврата средств
            </h1>
            <div class="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light">
              Условия возврата и возмещения
            </div>
          </div>
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
                <i class="fas fa-undo text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1. Общие условия</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Настоящая Политика возврата средств определяет условия и порядок возврата денежных средств за подписки на ИИ-ассистента, предоставляемые MikhailFur Technology.</p>
              <p>Возврат средств за подписки на ИИ-ассистента возможен только при соблюдении специальных условий, указанных в настоящей Политике.</p>
              <p>Все возвраты обрабатываются в течение 3-5 рабочих дней с момента получения заявления.</p>
            </div>
          </div>

          <!-- Refund Conditions -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-check-circle text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">2. Условия возврата</h2>
            </div>
            <div class="space-y-4 sm:space-y-6">
              <p class="text-gray-300 text-sm sm:text-base">Возврат средств за подписку на ИИ-ассистента возможен ТОЛЬКО при соблюдении ВСЕХ условий:</p>
              
              <div class="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-500/20 mb-6">
                <div class="flex items-center mb-3">
                  <i class="fas fa-exclamation-triangle text-red-400 mr-2 text-lg"></i>
                  <h3 class="text-lg font-semibold text-red-400">Важно!</h3>
                </div>
                <p class="text-sm text-gray-300">Возврат средств возможен только при одновременном соблюдении двух условий:</p>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-green-500/30">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-message text-green-400 mr-2"></i>
                    <h3 class="font-semibold text-green-400">Условие 1: Лимит запросов</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">Вы отправили не более 10 запросов в ИИ-ассистента</p>
                </div>
                
                <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-blue-500/30">
                  <div class="flex items-center mb-2">
                    <i class="fas fa-calendar text-blue-400 mr-2"></i>
                    <h3 class="font-semibold text-blue-400">Условие 2: Временной лимит</h3>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-400">С момента оформления подписки прошло не более 7 дней</p>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-500/20 mt-4">
                <div class="flex items-center mb-2">
                  <i class="fas fa-info-circle text-yellow-400 mr-2"></i>
                  <h3 class="font-semibold text-yellow-400">Дополнительные условия</h3>
                </div>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• Возврат возможен только за неиспользованный период подписки</li>
                  <li>• При превышении лимита запросов возврат не производится</li>
                  <li>• При превышении временного лимита возврат не производится</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Refund Process -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-list-ol text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3. Процедура возврата</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Для оформления возврата средств за подписку на ИИ-ассистента необходимо выполнить следующие шаги:</p>
              
              <div class="process-container mt-4 sm:mt-6 space-y-4 sm:space-y-6">
                <div class="process-step">
                  <h3 class="text-lg sm:text-xl font-semibold mb-2 text-green-400">Проверка условий</h3>
                  <p class="text-sm sm:text-base">Убедитесь, что вы соответствуете условиям возврата: не более 10 запросов и не более 7 дней с момента подписки.</p>
                </div>
                
                <div class="process-step">
                  <h3 class="text-lg sm:text-xl font-semibold mb-2 text-blue-400">Подача заявления</h3>
                  <p class="text-sm sm:text-base">Отправьте заявление на возврат средств на email: me@mikhailfur.ru с указанием номера подписки, количества использованных запросов и реквизитов для перевода.</p>
                </div>
                
                <div class="process-step">
                  <h3 class="text-lg sm:text-xl font-semibold mb-2 text-purple-400">Проверка и возврат</h3>
                  <p class="text-sm sm:text-base">Мы проверим соответствие условиям и вернем средства на указанные реквизиты в течение 3-5 рабочих дней.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-clock text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">4. Сроки возврата</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <div class="timeline-item">
                <h3 class="text-base sm:text-lg font-semibold text-green-400 mb-2">День 1</h3>
                <p class="text-sm sm:text-base">Подача заявления и проверка соответствия условиям</p>
              </div>
              <div class="timeline-item">
                <h3 class="text-base sm:text-lg font-semibold text-blue-400 mb-2">День 2-3</h3>
                <p class="text-sm sm:text-base">Проверка количества запросов и даты подписки</p>
              </div>
              <div class="timeline-item">
                <h3 class="text-base sm:text-lg font-semibold text-purple-400 mb-2">День 3-5</h3>
                <p class="text-sm sm:text-base">Возврат средств на указанные реквизиты</p>
              </div>
            </div>
          </div>

          <!-- Non-refundable -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-times text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">5. Невозвратные случаи</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Возврат средств за подписку на ИИ-ассистента НЕ производится в следующих случаях:</p>
              <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                <li>Вы отправили более 10 запросов в ИИ-ассистента</li>
                <li>С момента оформления подписки прошло более 7 дней</li>
                <li>Подписка была использована в полном объеме</li>
                <li>Нарушение правил использования ИИ-ассистента</li>
                <li>Попытка обмана или мошенничества</li>
                <li>Технические проблемы, не связанные с работой сервиса</li>
              </ul>
              
              <div class="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-red-500/30 mt-4">
                <div class="flex items-center mb-3">
                  <i class="fas fa-ban text-red-400 mr-2 text-lg"></i>
                  <h3 class="text-lg font-semibold text-red-400">КРИТИЧЕСКИ ВАЖНО!</h3>
                </div>
                <p class="text-sm text-gray-300 font-semibold">Возврат средств по подпискам, оплаченным в сервисе FurryPay (оплата зарубежных сервисов по низкой цене), НЕ ПРЕДУСМОТРЕН в принципе.</p>
                <p class="text-xs text-gray-400 mt-2">Это связано с особенностями работы сервиса FurryPay и невозможностью возврата средств по зарубежным сервисам.</p>
              </div>
            </div>
          </div>

          <!-- Partial Refund -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-percentage text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">6. Частичный возврат</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Частичный возврат средств за подписку на ИИ-ассистента НЕ предусмотрен.</p>
              
              <div class="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-500/20">
                <div class="flex items-center mb-3">
                  <i class="fas fa-ban text-red-400 mr-2"></i>
                  <h3 class="font-semibold text-red-400">Важно!</h3>
                </div>
                <p class="text-sm text-gray-300">Возврат средств за подписку на ИИ-ассистента возможен только в полном объеме при соблюдении всех условий. Частичные возвраты не производятся.</p>
              </div>
              
              <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-500/20">
                <div class="flex items-center mb-2">
                  <i class="fas fa-info-circle text-blue-400 mr-2"></i>
                  <h3 class="font-semibold text-blue-400">Альтернативы</h3>
                </div>
                <ul class="text-sm text-gray-300 space-y-1">
                  <li>• Приостановка подписки на оставшийся период</li>
                  <li>• Перенос неиспользованного времени на следующий период</li>
                  <li>• Обмен на другие услуги компании</li>
                </ul>
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
              <p>По вопросам возврата средств за подписку на ИИ-ассистента обращайтесь:</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-envelope text-green-400 mr-2"></i>
                  <span>Email: me@mikhailfur.ru</span>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-link text-green-400 mr-2"></i>
                  <span>Сайт: mikhailfur.ru</span>
                </div>
              </div>
              
              <div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-500/20 mt-4">
                <div class="flex items-center mb-2">
                  <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
                  <h3 class="font-semibold text-yellow-400">Совет</h3>
                </div>
                <p class="text-sm text-gray-300">В заявлении обязательно укажите номер подписки, количество использованных запросов и дату оформления подписки для ускорения обработки.</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="section-fade text-center text-gray-400 py-6 sm:py-8">
            <p class="text-sm sm:text-base">Политика возврата средств вступает в силу с момента публикации</p>
            <p class="mt-2 text-xs sm:text-sm">Последнее обновление: 6 сентября 2025 года</p>
            <p class="mt-2 text-xs text-gray-500">MikhailFur Technology | Политика возврата для ИИ-ассистента</p>
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

    // Add interactive effects to refund cards
    document.querySelectorAll('.refund-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.02, duration: 0.3, ease: 'power1.out' })
      })
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, duration: 0.3, ease: 'power1.out' })
      })
    })
  }
})

useHead({
  title: 'Политика возврата средств - MikhailFur'
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

.process-step {
  position: relative;
  padding-left: 3rem;
}

.process-step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #22c55e, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.process-step:nth-child(1)::after {
  content: '1';
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.process-step:nth-child(2)::after {
  content: '2';
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.process-step:nth-child(3)::after {
  content: '3';
  position: absolute;
  left: 0;
  top: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 2rem;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 0.75rem;
  height: 0.75rem;
  background: #22c55e;
  border-radius: 50%;
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: 0.25rem;
  top: 1.25rem;
  width: 2px;
  height: calc(100% + 1rem);
  background: linear-gradient(to bottom, #22c55e, transparent);
}

.timeline-item:last-child::after {
  display: none;
}

@media (max-width: 768px) {
  .process-step {
    padding-left: 2.5rem;
  }
  
  .process-step::before {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .process-step::after {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }
  
  .timeline-item {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .timeline-item::before {
    width: 0.5rem;
    height: 0.5rem;
  }
  
  .timeline-item::after {
    left: 0.125rem;
    top: 0.75rem;
  }
}
</style>
