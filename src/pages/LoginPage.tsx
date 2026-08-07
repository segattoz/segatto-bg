import { useState } from 'react'
import type { FormEvent } from 'react'
import { Radio } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function LoginPage() {
  const { signIn, isMockAuth } = useAuth()
  const [email, setEmail] = useState('matheus@pulsecrm.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-50 px-4 py-10 dark:bg-ink-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_10%,var(--color-brand-100)_0%,transparent_45%),radial-gradient(circle_at_80%_90%,var(--color-brand-50)_0%,transparent_40%)] dark:[background:radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.18)_0%,transparent_45%),radial-gradient(circle_at_80%_90%,rgba(79,70,229,0.12)_0%,transparent_40%)]"
      />

      <ThemeToggle className="absolute right-4 top-4" />

      <div className="animate-fade-in-up relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 dark:bg-brand-500">
            <span className="absolute inset-0 -z-10 animate-glow-pulse rounded-xl bg-brand-500/40 blur-lg" />
            <Radio className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-white">Pulse CRM</h1>
          <p className="mt-1 text-center text-sm text-ink-400">Priorização inteligente de leads para consultores de seguro de vida</p>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white/90 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur-sm dark:border-ink-800 dark:bg-ink-900/90">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-negative-600 dark:text-negative-400">{error}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          {isMockAuth && (
            <p className="mt-4 rounded-lg bg-warm-50 px-3 py-2 text-xs text-warm-600 ring-1 ring-inset ring-warm-100 dark:bg-warm-500/10 dark:text-warm-400 dark:ring-warm-500/20">
              Supabase não configurado — qualquer e-mail e senha entram em modo demonstração.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
