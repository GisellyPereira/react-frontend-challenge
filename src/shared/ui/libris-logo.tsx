import { cn } from '@/shared/lib/cn'

interface LibrisLogoProps {
  className?: string
  inverted?: boolean
}

export function LibrisLogo({ className, inverted = false }: LibrisLogoProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-3', className)}
      aria-label="Libris"
    >
      <span className="relative flex h-9 w-9 items-end justify-center gap-0.5 rounded-full bg-book-gold p-2 shadow-[0_4px_0_var(--color-ink)]">
        <span className="h-4 w-1.5 -rotate-6 rounded-sm bg-book-coral" />
        <span className="h-5 w-1.5 rounded-sm bg-ink" />
        <span className="h-3.5 w-1.5 rotate-6 rounded-sm bg-book-blue" />
      </span>
      <span
        className={cn(
          'font-display text-[1.7rem] leading-none font-semibold tracking-[-0.04em]',
          inverted ? 'text-paper' : 'text-ink',
        )}
      >
        libris<span className="text-book-coral">.</span>
      </span>
    </div>
  )
}
