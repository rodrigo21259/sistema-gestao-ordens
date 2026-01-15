import { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useLocation } from 'wouter'

export default function Login() {
  const [, setLocation] = useLocation()
  const { signIn, signUp } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Validar email @investsmart.com.br
        if (!email.endsWith('@investsmart.com.br')) {
          toast.error('Use um email @investsmart.com.br')
          setLoading(false)
          return
        }
        await signUp(email, password)
        toast.success('Conta criada! Faça login para continuar.')
        setIsSignUp(false)
        setEmail('')
        setPassword('')
      } else {
        await signIn(email, password)
        toast.success('Login realizado com sucesso!')
        setLocation('/')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ranking de Distribuição</CardTitle>
          <CardDescription>
            {isSignUp ? 'Criar nova conta' : 'Fazer login'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="seu.nome@investsmart.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Fazer Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
