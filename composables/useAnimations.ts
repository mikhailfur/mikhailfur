import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

export const useAnimations = () => {
  let animationFrameId: number | null = null
  let resizeHandler: (() => void) | null = null

  const initParticles = (canvasId: string) => {
    if (import.meta.client) {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      let width = window.innerWidth
      let height = window.innerHeight
      canvas.width = width
      canvas.height = height

      const particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        size: number
        opacity: number
        color: string
        targetX: number
        targetY: number
      }> = []
      const particleCount = 80
      const connectionDistance = 150

      const colors = [
        'rgba(59, 130, 246, ',
        'rgba(139, 92, 246, ',
        'rgba(236, 72, 153, ',
        'rgba(34, 197, 94, '
      ]

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          targetX: Math.random() * width,
          targetY: Math.random() * height
        })
      }

      const animateParticles = () => {
        ctx.clearRect(0, 0, width, height)

        particles.forEach((particle, i) => {
          const dx = particle.targetX - particle.x
          const dy = particle.targetY - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 5) {
            particle.targetX = Math.random() * width
            particle.targetY = Math.random() * height
          } else {
            particle.vx += (dx / distance) * 0.01
            particle.vy += (dy / distance) * 0.01
          }

          particle.vx *= 0.98
          particle.vy *= 0.98

          particle.x += particle.vx
          particle.y += particle.vy

          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -0.8
            particle.x = Math.max(0, Math.min(width, particle.x))
          }
          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -0.8
            particle.y = Math.max(0, Math.min(height, particle.y))
          }

          particles.slice(i + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < connectionDistance) {
              const opacity = (1 - distance / connectionDistance) * 0.2
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          })

          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          )
          gradient.addColorStop(0, `${particle.color}${particle.opacity})`)
          gradient.addColorStop(0.5, `${particle.color}${particle.opacity * 0.5})`)
          gradient.addColorStop(1, `${particle.color}0)`)

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        })

        animationFrameId = requestAnimationFrame(animateParticles)
      }

      animateParticles()

      resizeHandler = () => {
        width = window.innerWidth
        height = window.innerHeight
        canvas.width = width
        canvas.height = height
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

      counters.forEach((counter, index) => {
        const target = parseInt(counter.getAttribute('data-count') || '0')
        const duration = 2500
        const startTime = Date.now() + index * 100

        const animate = () => {
          const elapsed = Date.now() - startTime
          if (elapsed < 0) {
            requestAnimationFrame(animate)
            return
          }

          const progress = Math.min(elapsed / duration, 1)
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)
          const current = Math.floor(target * easeOutCubic)

          counter.textContent = current.toString()

          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }

        requestAnimationFrame(animate)
      })
    }
  }

  const initHeroAnimations = () => {
    if (import.meta.client) {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.animate-fade-in h1', {
          duration: 1.4,
          y: 50,
          opacity: 0,
          scale: 0.95,
          rotationX: -15
        })
        .from('.animate-fade-in p', {
          duration: 1.2,
          y: 30,
          opacity: 0,
          scale: 0.98
        }, '-=1')
        .from('.animate-fade-in .grid', {
          duration: 1.2,
          y: 40,
          opacity: 0,
          scale: 0.95,
          stagger: 0.15
        }, '-=0.8')
        .from('.animate-fade-in .flex', {
          duration: 1.2,
          y: 30,
          opacity: 0,
          scale: 0.95,
          stagger: 0.2
        }, '-=0.6')

      gsap.to('.animate-bounce-slow', {
        y: -15,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: {
          amount: 1.5,
          from: 'random'
        }
      })

      document.querySelectorAll('[data-count]').forEach(stat => {
        const parent = stat.closest('.bg-white\\/5')
        if (parent) {
          parent.addEventListener('mouseenter', () => {
            gsap.to(parent, {
              scale: 1.05,
              y: -5,
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)',
              duration: 0.5,
              ease: 'back.out(1.7)'
            })
            gsap.to(stat, {
              scale: 1.1,
              duration: 0.5,
              ease: 'power2.out'
            })
          })
          parent.addEventListener('mouseleave', () => {
            gsap.to(parent, {
              scale: 1,
              y: 0,
              boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
              duration: 0.4,
              ease: 'power2.in'
            })
            gsap.to(stat, {
              scale: 1,
              duration: 0.4,
              ease: 'power2.in'
            })
          })
        }
      })
    }
  }

  const initScrollAnimations = () => {
    if (import.meta.client) {
      gsap.utils.toArray<HTMLElement>('#projects .group, #about .group, #contact .group').forEach((element, index) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          },
          y: 60,
          opacity: 0,
          scale: 0.9,
          duration: 1,
          ease: 'power3.out',
          delay: index * 0.1
        })
      })

      gsap.utils.toArray<HTMLElement>('section h2').forEach((heading) => {
        gsap.from(heading, {
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          },
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out'
        })
      })

      gsap.utils.toArray<HTMLElement>('#about .flex.flex-wrap span').forEach((skill, index) => {
        gsap.from(skill, {
          scrollTrigger: {
            trigger: skill.closest('section'),
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          },
          scale: 0,
          opacity: 0,
          rotation: -180,
          duration: 0.6,
          ease: 'back.out(1.7)',
          delay: index * 0.05
        })
      })
    }
  }

  return {
    initParticles,
    animateCounters,
    initHeroAnimations,
    initScrollAnimations,
    cleanup
  }
}

