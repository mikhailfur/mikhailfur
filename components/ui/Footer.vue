<template>
  <footer class="relative py-12 px-6 overflow-hidden">
    <div class="relative z-10 max-w-6xl mx-auto">
      <div class="glass-card p-8 mb-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-xl font-bold mb-4 text-white">MikhailFur</h3>
            <p class="text-gray-200/80">Разработчик и создатель проектов</p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4 text-white">Проекты</h4>
            <ul class="space-y-2 text-gray-200/80">
              <li><a href="https://t.me/youralyasanbot" target="_blank" class="hover:text-blue-300 transition-colors">AlyaBot</a></li>
              <li><a href="https://pay.mikhailfur.ru" target="_blank" class="hover:text-blue-300 transition-colors">FurryPay</a></li>
              <li><a href="https://comic.mikhailfur.ru" target="_blank" class="hover:text-blue-300 transition-colors">Комикс</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4 text-white">Правовая информация</h4>
            <ul class="space-y-2 text-gray-200/80">
              <li><NuxtLink to="/offer" class="hover:text-blue-300 transition-colors">Публичная оферта</NuxtLink></li>
              <li><NuxtLink to="/privacy" class="hover:text-blue-300 transition-colors">Политика конфиденциальности</NuxtLink></li>
              <li><NuxtLink to="/refund" class="hover:text-blue-300 transition-colors">Политика возврата средств</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-200/80 text-sm">
          © 2025 MikhailFur. Все права защищены.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="https://github.com/mikhailfur" target="_blank" class="text-gray-200/80 hover:text-blue-300 transition-colors">
            <i class="fab fa-github"></i>
          </a>
          <a href="https://t.me/dataisnotfound" target="_blank" class="text-gray-200/80 hover:text-blue-300 transition-colors">
            <i class="fab fa-telegram"></i>
          </a>
          <a href="https://discord.com/users/1029691592845578270" target="_blank" class="text-gray-200/80 hover:text-blue-300 transition-colors">
            <i class="fab fa-discord"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

