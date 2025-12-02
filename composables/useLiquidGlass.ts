export const useLiquidGlass = () => {
  const mouseX = ref(0)
  const mouseY = ref(0)
  const isHovering = ref(false)

  const handleMouseMove = (event: MouseEvent, element: HTMLElement) => {
    if (!element) return

    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100

    mouseX.value = x
    mouseY.value = y

    element.style.setProperty('--mouse-x', `${percentX}%`)
    element.style.setProperty('--mouse-y', `${percentY}%`)
    element.style.setProperty('--rotate-x', `${rotateX}deg`)
    element.style.setProperty('--rotate-y', `${rotateY}deg`)
  }

  const handleMouseEnter = (element: HTMLElement) => {
    isHovering.value = true
    element.style.setProperty('--opacity', '1')
  }

  const handleMouseLeave = (element: HTMLElement) => {
    isHovering.value = false
    element.style.setProperty('--opacity', '0')
    element.style.setProperty('--rotate-x', '0deg')
    element.style.setProperty('--rotate-y', '0deg')
  }

  const initLiquidGlass = (selector: string) => {
    if (import.meta.client) {
      const elements = document.querySelectorAll<HTMLElement>(selector)

      elements.forEach((element) => {
        element.addEventListener('mousemove', (e) => handleMouseMove(e, element))
        element.addEventListener('mouseenter', () => handleMouseEnter(element))
        element.addEventListener('mouseleave', () => handleMouseLeave(element))
      })
    }
  }

  return {
    mouseX,
    mouseY,
    isHovering,
    initLiquidGlass
  }
}

