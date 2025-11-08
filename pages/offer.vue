<template>
  <div>
    <UiNavigation />
    
    <!-- Hero Section -->
    <section class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      <div class="absolute inset-0">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style="animation-delay: -3s;"></div>
      </div>
      
      <div class="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div class="animate-fade-in">
          <div class="mb-6">
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Публичная оферта
            </h1>
          </div>
          <p class="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 animate-slide-up max-w-3xl mx-auto leading-relaxed">
            Условия предоставления цифровых товаров и услуг
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
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-file-contract text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Общие положения</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p>Настоящий документ является официальным предложением (публичной офертой) Индивидуального предпринимателя "MikhailFur Technology", именуемого в дальнейшем «Исполнитель», в лице ИП "Пак Михаил Евгеньевич", действующего на основании свидетельства о государственной регистрации, и содержит все существенные условия предоставления услуг любому физическому лицу, именуемому в дальнейшем «Заказчик».</p>
              <p>В соответствии с пунктом 5 статьи 395 Гражданского Кодекса Республики Казахстан, в случае принятия изложенных ниже условий и оплаты услуг, лицо, производящее акцепт этой оферты, становится Заказчиком.</p>
            </div>
          </div>

          <!-- Terms -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-book text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">1. Термины и определения</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <div class="space-y-2">
                <p><strong>1.1. Оферта</strong> — настоящий документ, публичное предложение Исполнителя, адресованное неопределенному кругу лиц, заключить договор на оказание Услуг на условиях, содержащихся в настоящей Оферте.</p>
                <p><strong>1.2. Сайт</strong> — интернет-ресурс Исполнителя, расположенный по адресу: mikhailfur.ru.</p>
                <p><strong>1.3. Акцепт Оферты</strong> — полное и безоговорочное принятие Заказчиком условий настоящей Оферты путем совершения действий, указанных в разделе 8 настоящей Оферты. Акцепт Оферты создает Договор.</p>
                <p><strong>1.4. Заказчик</strong> — физическое лицо, совершившее Акцепт Оферты и являющееся получателем Услуг по заключенному Договору.</p>
                <p><strong>1.5. Исполнитель</strong> — ИП "MikhailFur Technology" (БИН: 071118550393).</p>
                <p><strong>1.6. Услуга</strong> — предоставление Заказчику доступа к программному обеспечению (ИИ-ассистенту) через чат-бот в мессенджере Telegram на условиях подписки.</p>
                <p><strong>1.7. Подписка</strong> — форма оказания Услуги, при которой Заказчику за периодическую плату предоставляется доступ к ИИ-ассистенту на определенный срок.</p>
                <p><strong>1.8. Тариф</strong> — стоимость, срок и объем предоставляемых Услуг в рамках Подписки, опубликованные на Сайте Исполнителя.</p>
              </div>
            </div>
          </div>

          <!-- Subject -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-handshake text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">2. Предмет договора</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>2.1.</strong> Исполнитель обязуется оказывать Заказчику Услуги по предоставлению доступа к ИИ-ассистенту в мессенджере Telegram в соответствии с выбранным и оплаченным Заказчиком Тарифом, а Заказчик обязуется принимать и оплачивать эти Услуги.</p>
              <p><strong>2.2.</strong> Содержание, объем, сроки и стоимость Услуг определяются Тарифами, размещенными на Сайте Исполнителя.</p>
              <p><strong>2.3.</strong> Услуга считается оказанной с момента предоставления доступа к функционалу ИИ-ассистента на оплаченный период.</p>
            </div>
          </div>

          <!-- Rights and Obligations -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-balance-scale text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">3. Права и обязанности сторон</h2>
            </div>
            <div class="space-y-4 sm:space-y-6 text-gray-300 text-sm sm:text-base">
              <div>
                <h3 class="text-lg font-semibold text-blue-400 mb-3">3.1. Исполнитель обязуется:</h3>
                <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                  <li>Предоставить Заказчику доступ к Услуге после оплаты Подписки в соответствии с выбранным Тарифом</li>
                  <li>Обеспечивать работоспособность ИИ-ассистента и прилагать все возможные усилия для устранения сбоев в его работе в кратчайшие сроки</li>
                  <li>Сохранять конфиденциальность информации Заказчика, полученной при регистрации и использовании сервиса</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-green-400 mb-3">3.2. Исполнитель вправе:</h3>
                <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                  <li>Временно приостанавливать работу сервиса для проведения технических работ</li>
                  <li>В одностороннем порядке изменять условия настоящей Оферты и Тарифы</li>
                  <li>Заблокировать доступ Заказчика к Услуге в случае нарушения им условий настоящей Оферты</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-yellow-400 mb-3">3.3. Заказчик обязуется:</h3>
                <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                  <li>Своевременно и в полном объеме оплачивать Услуги Исполнителя согласно выбранному Тарифу</li>
                  <li>Использовать ИИ-ассистент исключительно в законных целях</li>
                  <li>Не передавать свои данные доступа третьим лицам</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-cyan-400 mb-3">3.4. Заказчик вправе:</h3>
                <ul class="list-disc list-inside space-y-1 sm:space-y-2 ml-3 sm:ml-4">
                  <li>Получать доступ к Услуге в соответствии с условиями оплаченного Тарифа</li>
                  <li>Обращаться в службу поддержки Исполнителя по вопросам, связанным с оказанием Услуг</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Payment -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-credit-card text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">4. Стоимость услуг и порядок расчетов</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>4.1.</strong> Стоимость Услуг определяется Тарифами, опубликованными на Сайте Исполнителя.</p>
              <p><strong>4.2.</strong> Оплата производится Заказчиком на условиях 100% предоплаты в безналичном порядке через платежные системы, доступные на Сайте.</p>
              <p><strong>4.3.</strong> Подписка продлевается автоматически (рекуррентные платежи), если Заказчик не отменил ее до окончания текущего оплаченного периода.</p>
              <p><strong>4.4.</strong> Все расчеты производятся в российских рублях (RUB).</p>
              <p><strong>4.5.</strong> Возврат денежных средств за уже оказанные услуги или за оплаченный период, в течение которого Заказчик имел доступ к Услуге, не производится.</p>
            </div>
          </div>

          <!-- Responsibility -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-shield-alt text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">5. Ответственность сторон</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>5.1.</strong> Исполнитель не несет ответственности за любые убытки или ущерб (прямой или косвенный), понесенные Заказчиком в результате использования или невозможности использования ИИ-ассистента.</p>
              <p><strong>5.2.</strong> ИИ-ассистент предоставляется по принципу "как есть" ("as is"). Исполнитель не гарантирует, что информация, сгенерированная ассистентом, будет безошибочной, точной или соответствовать конкретным целям Заказчика.</p>
              <p><strong>5.3.</strong> Заказчик несет полную ответственность за законность своих действий при использовании Услуги.</p>
              <p><strong>5.4.</strong> Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Договору, если это неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор).</p>
            </div>
          </div>

          <!-- Confidentiality -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-lock text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">6. Конфиденциальность и защита персональных данных</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>6.1.</strong> Предоставляя свои персональные данные, Заказчик дает согласие на их обработку Исполнителем в целях исполнения настоящего Договора.</p>
              <p><strong>6.2.</strong> Исполнитель обязуется не разглашать полученную от Заказчика информацию и принимать необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа.</p>
            </div>
          </div>

          <!-- Contract Terms -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-calendar-alt text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">7. Срок действия и порядок расторжения договора</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>7.1.</strong> Договор вступает в силу с момента Акцепта Оферты Заказчиком и действует до полного исполнения Сторонами своих обязательств.</p>
              <p><strong>7.2.</strong> Договор считается продленным на следующий период на условиях выбранного Тарифа при каждой последующей оплате Подписки.</p>
              <p><strong>7.3.</strong> Заказчик вправе отказаться от Услуг Исполнителя, отменив подписку. В этом случае доступ к Услуге прекращается по окончании уже оплаченного периода.</p>
            </div>
          </div>

          <!-- Acceptance -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-check-circle text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">8. Порядок акцепта оферты</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>8.1.</strong> Акцептом настоящей Оферты является совершение Заказчиком оплаты Услуг Исполнителя в соответствии с выбранным Тарифом.</p>
              <p><strong>8.2.</strong> Совершая Акцепт, Заказчик подтверждает, что он полностью ознакомлен, согласен и принимает все условия настоящей Оферты.</p>
            </div>
          </div>

          <!-- Disputes -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-gavel text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">9. Разрешение споров</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <p><strong>9.1.</strong> Все споры и разногласия, которые могут возникнуть между Сторонами, будут разрешаться путем переговоров.</p>
              <p><strong>9.2.</strong> В случае невозможности разрешения споров путем переговоров, они подлежат рассмотрению в суде по месту нахождения Исполнителя в соответствии с действующим законодательством Республики Казахстан.</p>
            </div>
          </div>

          <!-- Contact -->
          <div class="section-fade glass-effect rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 hover-lift">
            <div class="flex items-center mb-4 sm:mb-6">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <i class="fas fa-envelope text-white text-lg sm:text-xl"></i>
              </div>
              <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">10. Реквизиты исполнителя</h2>
            </div>
            <div class="space-y-3 sm:space-y-4 text-gray-300 text-sm sm:text-base">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-building text-blue-400 mr-2"></i>
                  <span>ИП "MikhailFur Technology"</span>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-id-card text-green-400 mr-2"></i>
                  <span>БИН: 071118550393</span>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-code text-purple-400 mr-2"></i>
                  <span>ОКЭД: 62011</span>
                </div>
                <div class="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <i class="fas fa-link text-cyan-400 mr-2"></i>
                  <span>Сайт: mikhailfur.ru</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="section-fade text-center text-gray-400 py-6 sm:py-8">
            <p class="text-sm sm:text-base">Документ вступает в силу с момента публикации на сайте</p>
            <p class="mt-2 text-xs sm:text-sm">Последнее обновление: 6 сентября 2025 года</p>
            <p class="mt-2 text-xs text-gray-500">ИП "MikhailFur Technology" | ИИН: 071118550393</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Back to Home -->
    <section class="py-8 sm:py-12 px-4 sm:px-6">
      <div class="max-w-4xl mx-auto text-center">
        <NuxtLink to="/" class="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
          <i class="fas fa-arrow-left mr-2"></i>
          Вернуться на главную
        </NuxtLink>
      </div>
    </section>

    <UiFooter />
  </div>
</template>

<script setup lang="ts">
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
  }
})

useHead({
  title: 'Публичная оферта - MikhailFur'
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
