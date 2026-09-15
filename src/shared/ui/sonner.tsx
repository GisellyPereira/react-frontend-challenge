import type { CSSProperties } from 'react'
import { CircleCheck, CircleAlert, X } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import './sonner.css'

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      duration={4500}
      visibleToasts={3}
      offset={24}
      mobileOffset={16}
      containerAriaLabel="Notificações"
      icons={{
        success: <CircleCheck size={20} />,
        error: <CircleAlert size={20} />,
        close: <X size={14} />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '0.85rem',
          fontFamily: 'var(--font-family-ui)',
        } as CSSProperties
      }
      toastOptions={{
        closeButtonAriaLabel: 'Fechar notificação',
        classNames: {
          toast: 'libris-toast',
          title: 'libris-toast__title',
          description: 'libris-toast__description',
        },
      }}
      {...props}
    />
  )
}
