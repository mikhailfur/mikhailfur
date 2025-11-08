// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts'
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
      Montserrat: [400, 900]
    },
    display: 'swap'
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'MikhailFur Technology',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'MikhailFur - Frontend Developer, Game Developer, UI/UX Designer' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/src/favicon.ico' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }
      ],
      script: [
        {
          src: 'https://mc.yandex.ru/metrika/tag.js',
          async: true,
          type: 'text/javascript'
        },
        {
          innerHTML: `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104052511', 'ym');
            ym(104052511, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
          `,
          type: 'text/javascript'
        }
      ],
      noscript: [
        {
          innerHTML: '<div><img src="https://mc.yandex.ru/watch/104052511" style="position:absolute; left:-9999px;" alt="" /></div>'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://mikhailfur.ru'
    }
  }
})

