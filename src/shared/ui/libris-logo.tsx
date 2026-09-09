import librisLogoUrl from '@/shared/assets/libris-logo.svg'
import { cn } from '@/shared/lib/cn'

import './libris-logo.css'

interface LibrisLogoProps {
  className?: string
  size?: 'compact' | 'display'
}

export function LibrisLogo({ className, size = 'compact' }: LibrisLogoProps) {
  return (
    <img
      alt="Libris"
      className={cn('libris-logo', `libris-logo--${size}`, className)}
      data-login-logo
      src={librisLogoUrl}
    />
  )
}
