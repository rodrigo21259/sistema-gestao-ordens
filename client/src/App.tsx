import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Route, Switch, Redirect } from 'wouter'
import Login from '@/pages/Login'
import { Toaster } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'

// Um componente simples para uma rota protegida
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <Component {...rest} /> : <Redirect to="/login" />
}

// Páginas de exemplo para simular o app
const Home = () => <div>Página Principal - Você está logado!</div>
const OrderForm = () => <div>Formulário de Ordem</div>
const Ranking = () => <div>Página de Ranking</div>
const AdminDashboard = () => <div>Painel do Admin</div>

export default function App() {
  const { loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Toaster />
      <Switch>
        <Route path="/login" component={Login} />
        
        {/* Rotas Protegidas */}
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/ordem" component={OrderForm} />
        <ProtectedRoute path="/ranking" component={Ranking} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />

        {/* Se nenhuma rota bater, redireciona para a home (que vai redirecionar para o login se não estiver logado) */}
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </>
  )
}
