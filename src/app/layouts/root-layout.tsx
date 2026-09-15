import { Outlet } from '@tanstack/react-router'
import { ThemeSync, useThemeStore } from '@/features/theme'
import { Toaster } from '@/shared/ui/sonner'
import { SmoothScroll } from '@/app/providers/smooth-scroll'

export function RootLayout() {
  const theme = useThemeStore((state) => state.theme)
  return (
    <>
      <ThemeSync />
      <SmoothScroll />
      <Outlet />
      <Toaster theme={theme} />
    </>
  )
}
