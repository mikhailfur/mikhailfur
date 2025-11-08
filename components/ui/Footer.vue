<template>
  <footer class="relative py-12 px-6 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40"></div>
    <div class="absolute inset-0">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float" style="animation-delay: -2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl animate-float" style="animation-delay: -4s;"></div>
    </div>
    <div class="relative z-10 max-w-6xl mx-auto">
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="text-xl font-bold mb-4">MikhailFur</h3>
          <p class="text-gray-300">Разработчик и создатель проектов</p>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">Проекты</h4>
          <ul class="space-y-2 text-gray-300">
            <li><a href="https://t.me/youralyasanbot" target="_blank" class="hover:text-white transition-colors">AlyaBot</a></li>
            <li><a href="https://pay.mikhailfur.ru" target="_blank" class="hover:text-white transition-colors">FurryPay</a></li>
            <li><a href="https://comic.mikhailfur.ru" target="_blank" class="hover:text-white transition-colors">Комикс</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">Правовая информация</h4>
          <ul class="space-y-2 text-gray-300">
            <li><NuxtLink to="/offer" class="hover:text-white transition-colors">Публичная оферта</NuxtLink></li>
            <li><NuxtLink to="/privacy" class="hover:text-white transition-colors">Политика конфиденциальности</NuxtLink></li>
            <li><NuxtLink to="/refund" class="hover:text-white transition-colors">Политика возврата средств</NuxtLink></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-300 text-sm">
          © 2025 MikhailFur. Все права защищены.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="https://github.com/mikhailfur" target="_blank" class="text-gray-300 hover:text-white transition-colors">
            <i class="fab fa-github"></i>
          </a>
          <a href="https://t.me/dataisnotfound" target="_blank" class="text-gray-300 hover:text-white transition-colors">
            <i class="fab fa-telegram"></i>
          </a>
          <a href="https://discord.com/users/1029691592845578270" target="_blank" class="text-gray-300 hover:text-white transition-colors">
            <i class="fab fa-discord"></i>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

