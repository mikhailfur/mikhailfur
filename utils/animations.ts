// Утилиты для анимаций

export const animationConfig = {
  particles: {
    count: 50,
    speed: 0.2,
    size: { min: 0.5, max: 2 },
    opacity: { min: 0.1, max: 0.4 }
  },
  counter: {
    duration: 2500,
    delay: 1000
  },
  typewriter: {
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000
  }
}

export const scrollObserverOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
} as IntersectionObserverInit

