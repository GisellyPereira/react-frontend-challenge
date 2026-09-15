import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export function SmoothScroll() {
  const router = useRouter()

  useEffect(() => {
    if (!window.matchMedia) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | undefined

    const syncLock = () => {
      if (document.body.hasAttribute('data-scroll-locked')) {
        if (lenis && !lenis.isStopped) lenis.stop()
      } else if (lenis?.isStopped) lenis.start()
    }
    const configure = () => {
      lenis?.destroy()
      lenis = undefined
      if (motion.matches) return
      lenis = new Lenis({
        autoRaf: true,
        lerp: 0.14,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        allowNestedScroll: false,
        prevent: (node) =>
          node.matches(
            '[role="dialog"], [role="listbox"], [data-radix-scroll-area-viewport]',
          ),
      })
      syncLock()
    }
    configure()
    motion.addEventListener('change', configure)
    const observer = new MutationObserver(syncLock)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    })
    const unsubscribe = router.subscribe('onBeforeLoad', (event) => {
      if (event.fromLocation?.pathname === event.toLocation.pathname) return
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
    })
    return () => {
      unsubscribe()
      observer.disconnect()
      motion.removeEventListener('change', configure)
      lenis?.destroy()
    }
  }, [router])

  return null
}
