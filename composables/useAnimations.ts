import gsap from 'gsap'

export const useAnimations = () => {
  let animationFrameId: number | null = null
  let resizeHandler: (() => void) | null = null

  const initParticles = (canvasId: string) => {
    if (import.meta.client) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        size: number
        opacity: number
      }> = []
      const particleCount = 50

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1
        })
      }

      const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach(particle => {
          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(59, 130, 246, ${particle.opacity})`
          ctx.fill()
        })

        animationFrameId = requestAnimationFrame(animateParticles)
      }

      animateParticles()

      resizeHandler = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }

      window.addEventListener('resize', resizeHandler)
    }
  }

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
  }

  const animateCounters = () => {
    if (import.meta.client) {
      const counters = document.querySelectorAll('[data-count]')

      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count') || '0')
        const duration = 2000
        const increment = target / (duration / 16)
        let current = 0

        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          counter.textContent = Math.floor(current).toString()
        }, 16)
      })
    }
  }

  const initHeroAnimations = () => {
    if (import.meta.client) {
      gsap.timeline()
        .from('.animate-fade-in h1', { duration: 1.2, y: 30, opacity: 0, ease: 'power1.out' })
        .from('.animate-fade-in p', { duration: 1, y: 20, opacity: 0, ease: 'power1.out' }, '-=0.7')
        .from('.animate-fade-in .grid', { duration: 1, y: 20, opacity: 0, ease: 'power1.out' }, '-=0.5')
        .from('.animate-fade-in .flex', { duration: 1, y: 20, opacity: 0, ease: 'power1.out' }, '-=0.5')

      gsap.to('.animate-bounce-slow', {
        y: -10,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3
      })

      document.querySelectorAll('[data-count]').forEach(stat => {
        stat.addEventListener('mouseenter', () => {
          gsap.to(stat, { scale: 1.05, duration: 0.4, ease: 'power1.out' })
        })
        stat.addEventListener('mouseleave', () => {
          gsap.to(stat, { scale: 1, duration: 0.4, ease: 'power1.out' })
        })
      })
    }
  }

  return {
    initParticles,
    animateCounters,
    initHeroAnimations,
    cleanup
  }
}

