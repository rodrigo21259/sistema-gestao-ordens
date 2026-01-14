import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Sun, Moon, BarChart3, FileText, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";
import OrderForm from "./OrderForm";
import Ranking from "./Ranking";
import AdminDashboard from "./AdminDashboard";
import { useState } from "react";

export default function Home() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<"orders" | "ranking" | "admin">("orders");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="inline-block p-3 bg-primary/20 rounded-full mb-4">
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Ranking de Distribuição</h1>
          <p className="text-lg text-muted-foreground">Sistema de Gestão de Ordens e Ranking</p>
        </div>

        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Bem-vindo!</CardTitle>
            <CardDescription>Faça login para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Registre suas ordens de venda e acompanhe seu desempenho em tempo real no ranking.
            </p>
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="w-full"
              size="lg"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Registre Ordens</p>
              <p className="text-xs text-muted-foreground">Adicione suas vendas facilmente</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Acompanhe Ranking</p>
              <p className="text-xs text-muted-foreground">Veja sua posição em tempo real</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-6 text-center">
              <Settings className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">Gerencie Tudo</p>
              <p className="text-xs text-muted-foreground">Controle total para admins</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Ranking de Distribuição</h1>
            <p className="text-sm text-muted-foreground">
              {user?.role === "admin" ? "Painel Administrativo" : "Operador"} • {user?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
              className="hover:bg-primary/10"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Sair"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2 sticky top-8">
              <Button
                variant={currentPage === "orders" ? "default" : "outline"}
                className="w-full justify-start gap-2 h-10"
                onClick={() => setCurrentPage("orders")}
              >
                <FileText className="h-4 w-4" />
                <span>Registrar Ordem</span>
              </Button>
              <Button
                variant={currentPage === "ranking" ? "default" : "outline"}
                className="w-full justify-start gap-2 h-10"
                onClick={() => setCurrentPage("ranking")}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Ranking</span>
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant={currentPage === "admin" ? "default" : "outline"}
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => setCurrentPage("admin")}
                >
                  <Settings className="h-4 w-4" />
                  <span>Administração</span>
                </Button>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentPage === "orders" && <OrderForm />}
            {currentPage === "ranking" && <Ranking />}
            {currentPage === "admin" && user?.role === "admin" && <AdminDashboard />}
          </div>
        </div>
      </div>
    </div>
  );
}
