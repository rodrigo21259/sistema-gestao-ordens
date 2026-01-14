import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Sun, Moon, BarChart3, FileText, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import OrderForm from "./OrderForm";
import Ranking from "./Ranking";
import AdminDashboard from "./AdminDashboard";
import { useState } from "react";

export default function Home() {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Sistema de Ranking</CardTitle>
            <CardDescription>Gestão de Ordens e Ranking de Operadores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Faça login para acessar o sistema e começar a registrar suas ordens.
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Sistema de Ranking</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user?.name || user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              title="Sair"
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
                className="w-full justify-start"
                onClick={() => setCurrentPage("orders")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Minhas Ordens
              </Button>
              <Button
                variant={currentPage === "ranking" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setCurrentPage("ranking")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Ranking
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant={currentPage === "admin" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setCurrentPage("admin")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Administração
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
