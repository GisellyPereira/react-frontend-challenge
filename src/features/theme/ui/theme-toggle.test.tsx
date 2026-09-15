import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { useThemeStore } from '../model/theme-store'
import { ThemeSync } from './theme-sync'
import { ThemeToggle } from './theme-toggle'

beforeEach(() => useThemeStore.setState({ theme: 'light' }))
afterEach(() => {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.removeProperty('color-scheme')
  useThemeStore.persist.clearStorage()
})

it('alterna o tema por teclado, sincroniza o documento e atualiza o nome acessível', async () => {
  const user = userEvent.setup()
  render(
    <>
      <ThemeSync />
      <ThemeToggle />
    </>,
  )
  await user.tab()
  expect(
    screen.getByRole('button', { name: 'Ativar tema escuro' }),
  ).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(document.documentElement).toHaveClass('dark')
  expect(document.documentElement.style.colorScheme).toBe('dark')
  expect(
    screen.getByRole('button', { name: 'Ativar tema claro' }),
  ).toHaveFocus()
  await user.keyboard(' ')
  expect(document.documentElement).not.toHaveClass('dark')
  expect(document.documentElement.style.colorScheme).toBe('light')
})
