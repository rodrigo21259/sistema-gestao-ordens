import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Moon, Sun, Home } from "lucide-react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
            title="Ir para página inicial"
          >
            <Home className="h-5 w-5 text-primary" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ranking de Distribuição
          </h1>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-primary/10"
          title={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
