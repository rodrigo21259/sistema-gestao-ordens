import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, FileText, Settings, LogOut } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ranking de Distribuição
              </h1>
              <p className="text-xl text-muted-foreground">
                Sistema inteligente de gestão de ordens e ranking de operadores
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-12">
              <Card className="border-primary/20 hover:border-primary/50 transition-colors shadow-md">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Registro de Ordens</h3>
                  <p className="text-sm text-muted-foreground">Registre suas ordens de vendas de forma rápida e fácil</p>
                </CardContent>
              </Card>

              <Card className="border-accent/20 hover:border-accent/50 transition-colors shadow-md">
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Ranking em Tempo Real</h3>
                  <p className="text-sm text-muted-foreground">Acompanhe sua posição e performance no ranking</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20 hover:border-primary/50 transition-colors shadow-md">
                <CardContent className="pt-6 text-center">
                  <Settings className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Painel Administrativo</h3>
                  <p className="text-sm text-muted-foreground">Gerencie usuários e configure métricas</p>
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={() => window.location.href = getLoginUrl()}
              size="lg"
              className="text-lg px-8 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Bem-vindo, {user?.name || user?.email}!</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "admin" ? "Painel Administrativo" : "Operador"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Registro de Ordem */}
          <Card 
            className="border-primary/20 hover:border-primary/50 transition-all cursor-pointer shadow-md hover:shadow-lg"
            onClick={() => navigate("/order-form")}
          >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Registrar Ordem</CardTitle>
                  <CardDescription>Registre uma nova ordem de venda</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Preencha os dados da ordem com informações do cliente, produto e receita.
              </p>
              <Button className="w-full" onClick={() => navigate("/order-form")}>
                Ir para Registro
              </Button>
            </CardContent>
          </Card>

          {/* Ranking */}
          <Card 
            className="border-accent/20 hover:border-accent/50 transition-all cursor-pointer shadow-md hover:shadow-lg"
            onClick={() => navigate("/ranking")}
          >
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 border-b">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-accent" />
                <div>
                  <CardTitle>Ver Ranking</CardTitle>
                  <CardDescription>Acompanhe o ranking mensal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Visualize sua posição, score e compare com outros operadores.
              </p>
              <Button className="w-full" onClick={() => navigate("/ranking")}>
                Ir para Ranking
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          {user?.role === "admin" && (
            <Card 
              className="border-primary/20 hover:border-primary/50 transition-all cursor-pointer shadow-md hover:shadow-lg md:col-span-2"
              onClick={() => navigate("/admin")}
            >
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Painel Administrativo</CardTitle>
                    <CardDescription>Gerencie o sistema</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Acesse gerenciamento de usuários, campos dinâmicos, métricas de ranking e exportação de dados.
                </p>
                <Button className="w-full" onClick={() => navigate("/admin")}>
                  Ir para Administração
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
