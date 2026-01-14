import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trophy, Medal, TrendingUp, Calendar } from "lucide-react";

interface RankingEntry {
  userId: number;
  userName: string;
  totalRevenue: string;
  orderCount: number;
  score: string;
  position: number;
}

export default function Ranking() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [currentUserScore, setCurrentUserScore] = useState<string>("0.00");

  const { data: rankingData, isLoading } = trpc.ranking.getRanking.useQuery();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const months = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!selectedMonth) {
      setSelectedMonth(String(currentMonth));
    }
    if (!selectedYear) {
      setSelectedYear(String(currentYear));
    }
  }, []);

  useEffect(() => {
    if (rankingData) {
      setRanking(rankingData.ranking);
      setCurrentUserPosition(rankingData.currentUserPosition);
      setCurrentUserScore(rankingData.currentUserScore);
    }
  }, [rankingData]);

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500 drop-shadow-lg" />;
    if (position === 2) return <Medal className="h-6 w-6 text-gray-400 drop-shadow-lg" />;
    if (position === 3) return <Medal className="h-6 w-6 text-orange-600 drop-shadow-lg" />;
    return <span className="text-lg font-bold text-primary">#{position}</span>;
  };

  const getTopThreeClass = (position: number) => {
    if (position === 1) 
      return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-l-4 border-yellow-500 shadow-md";
    if (position === 2) 
      return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-l-4 border-gray-400 shadow-md";
    if (position === 3) 
      return "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-l-4 border-orange-600 shadow-md";
    return "border hover:shadow-md transition-shadow";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUserPosition && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sua Posição Atual</p>
                <p className="text-4xl font-bold text-primary">#{currentUserPosition}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Seu Score</p>
                <p className="text-4xl font-bold text-accent">{currentUserScore}</p>
              </div>
              <div className="hidden md:block">
                <TrendingUp className="h-12 w-12 text-primary/30" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Ranking Mensal</CardTitle>
                <CardDescription>Posições atualizadas em tempo real</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Mês</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">Ano</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {ranking.map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-lg border transition-all ${getTopThreeClass(entry.position)}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center min-w-fit">
                      {getPositionBadge(entry.position)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.userName}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span>Receita: <span className="font-semibold">R$ {parseFloat(entry.totalRevenue).toFixed(2)}</span></span>
                        <span>Ordens: <span className="font-semibold">{entry.orderCount}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-fit">
                    <p className="text-2xl font-bold text-primary">{entry.score}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <CardTitle>Como Funciona o Ranking</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-semibold text-sm text-primary mb-2">💰 Receita</p>
              <p className="text-sm text-muted-foreground">Valor total gerado pelas suas ordens. Quanto maior, melhor sua posição.</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <p className="font-semibold text-sm text-accent mb-2">📊 Quantidade de Ordens</p>
              <p className="text-sm text-muted-foreground">Número total de ordens registradas. Mais ordens = mais pontos.</p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Score Final:</span> Calculado automaticamente combinando receita e quantidade de ordens com pesos configuráveis pelo administrador. Os dados são atualizados em tempo real.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
