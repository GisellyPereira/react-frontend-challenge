import { Dialog as Primitive } from 'radix-ui'
import { X } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export const Dialog = Primitive.Root
export const DialogTrigger = Primitive.Trigger
export const DialogTitle = Primitive.Title
export const DialogDescription = Primitive.Description

export function DialogContent({
  children,
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <Primitive.Content
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-xl',
          className,
        )}
        {...props}
      >
        {children}
        <Primitive.Close
          className="absolute top-4 right-4 rounded p-2 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Fechar leitor"
        >
          <X className="size-5" />
        </Primitive.Close>
      </Primitive.Content>
    </Primitive.Portal>
  )
}
