import type { ComponentProps, PointerEvent } from 'react'

import { cn } from '@/shared/lib/cn'

import { Button } from './button'
import './radial-fill-button.css'

type RadialFillButtonProps = Omit<ComponentProps<typeof Button>, 'asChild'>

function updateFillOrigin(event: PointerEvent<HTMLButtonElement>) {
  const button = event.currentTarget
  const bounds = button.getBoundingClientRect()
  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top
  const horizontalRadius = Math.max(x, bounds.width - x)
  const verticalRadius = Math.max(y, bounds.height - y)
  const diameter = Math.hypot(horizontalRadius, verticalRadius) * 2

  button.style.setProperty('--radial-fill-x', `${x}px`)
  button.style.setProperty('--radial-fill-y', `${y}px`)
  button.style.setProperty('--radial-fill-size', `${diameter}px`)
}

export function RadialFillButton({
  children,
  className,
  onPointerEnter,
  onPointerLeave,
  ...props
}: RadialFillButtonProps) {
  return (
    <Button
      className={cn('radial-fill-button', className)}
      onPointerEnter={(event) => {
        updateFillOrigin(event)
        onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        updateFillOrigin(event)
        onPointerLeave?.(event)
      }}
      {...props}
    >
      <span aria-hidden="true" className="radial-fill-button__fill" />
      <span className="radial-fill-button__content">{children}</span>
    </Button>
  )
}
