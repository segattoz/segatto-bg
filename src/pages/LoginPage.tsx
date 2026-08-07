import { useState } from 'react'
import type { FormEvent } from 'react'
import { Radio } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'

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
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900">
            <Radio className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-ink-900">Pulse CRM</h1>
          <p className="mt-1 text-sm text-ink-400">Priorização inteligente de leads pós-reunião</p>
        </div>

        <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
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

            {error && <p className="text-sm text-negative-600">{error}</p>}

            <Button type="submit" className="w-full" loading={loading}>
              Entrar
            </Button>
          </form>

          {isMockAuth && (
            <p className="mt-4 rounded-lg bg-warm-50 px-3 py-2 text-xs text-warm-600 ring-1 ring-inset ring-warm-100">
              Supabase não configurado — qualquer e-mail e senha entram em modo demonstração.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
