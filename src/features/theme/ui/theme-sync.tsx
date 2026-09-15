import { useLayoutEffect } from 'react'
import { useThemeStore } from '../model/theme-store'

export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  return null
}
