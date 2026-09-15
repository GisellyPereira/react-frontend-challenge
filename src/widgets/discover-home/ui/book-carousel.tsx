import { Children, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function BookCarousel({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  const [viewport, carousel] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  })
  const [edges, setEdges] = useState({ start: true, end: true })
  useEffect(() => {
    if (!carousel) return
    const update = () =>
      setEdges({
        start: !carousel.canScrollPrev(),
        end: !carousel.canScrollNext(),
      })
    const frame = requestAnimationFrame(update)
    carousel.on('select', update).on('reInit', update)
    return () => {
      cancelAnimationFrame(frame)
      carousel.off('select', update).off('reInit', update)
    }
  }, [carousel])
  const move = (direction: number) => {
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (direction > 0) carousel?.scrollNext(reduced)
    else carousel?.scrollPrev(reduced)
  }
  return (
    <div
      className="home-carousel"
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
    >
      <Button
        className="home-carousel__arrow"
        variant="outline"
        size="icon"
        aria-label={`Livros anteriores: ${label}`}
        disabled={edges.start}
        onClick={() => move(-1)}
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </Button>
      <div
        className="home-carousel__viewport"
        ref={viewport}
        tabIndex={0}
        aria-label={`Livros de ${label}. Use as setas para navegar.`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            move(event.key === 'ArrowRight' ? 1 : -1)
          }
        }}
      >
        <div className="home-carousel__track">
          {Children.toArray(children).map((child, index) => (
            <div
              className="home-carousel__slide"
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${Children.count(children)}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      <Button
        className="home-carousel__arrow"
        variant="outline"
        size="icon"
        aria-label={`Próximos livros: ${label}`}
        disabled={edges.end}
        onClick={() => move(1)}
      >
        <ArrowRight size={19} aria-hidden="true" />
      </Button>
    </div>
  )
}
