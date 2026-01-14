import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
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

// Formatar valor monetário no padrão brasileiro (R$ 1.234.567,89)
const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return numValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Ranking() {
  const { user } = useAuth();
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
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);

      const filteredRanking = rankingData.ranking
        .sort((a: RankingEntry, b: RankingEntry) => parseFloat(b.score) - parseFloat(a.score))
        .map((entry: RankingEntry, index: number) => ({
          ...entry,
          position: index + 1,
        }));

      setRanking(filteredRanking);

      const userEntry = filteredRanking.find((entry: RankingEntry) => entry.userId === user?.id);
      if (userEntry) {
        setCurrentUserPosition(userEntry.position);
        setCurrentUserScore(userEntry.score);
      } else {
        setCurrentUserPosition(null);
        setCurrentUserScore("0.00");
      }
    }
  }, [rankingData, selectedMonth, selectedYear, user?.id]);

  const topThree = ranking.slice(0, 3);
  const restRanking = ranking.slice(3);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Filtros */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Filtrar Ranking</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Mês</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="mt-1">
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
                  <label className="text-sm font-medium">Ano</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="mt-1">
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
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Top 3 */}
              {topThree.length > 0 && (
                <Card className="border-accent/30 shadow-lg bg-gradient-to-br from-accent/5 to-background">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-accent" />
                      Top 3 Operadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {topThree.map((entry) => (
                        <div
                          key={entry.userId}
                          className="p-6 rounded-lg border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-background hover:border-accent/50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              {getMedalIcon(entry.position)}
                              <span className="text-2xl font-bold text-accent">#{entry.position}</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-lg mb-3">{entry.userName}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Receita:</span>
                              <span className="font-semibold">{formatCurrency(entry.totalRevenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ordens:</span>
                              <span className="font-semibold">{entry.orderCount}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-accent/20">
                              <span className="text-muted-foreground">Score:</span>
                              <span className="font-bold text-accent text-lg">{parseFloat(entry.score).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posição do Usuário Atual */}
              {currentUserPosition && currentUserPosition > 3 && (
                <Card className="border-primary/20 shadow-md bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sua Posição</p>
                        <p className="text-3xl font-bold text-primary">#{currentUserPosition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Seu Score</p>
                        <p className="text-3xl font-bold text-accent">{parseFloat(currentUserScore).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ranking Completo */}
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Ranking Completo
                  </CardTitle>
                  <CardDescription>
                    {months.find((m) => m.value === selectedMonth)?.label} de {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {ranking.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-primary/20">
                            <th className="text-left py-3 px-2 font-semibold text-primary">Posição</th>
                            <th className="text-left py-3 px-2 font-semibold text-primary">Operador</th>
                            <th className="text-right py-3 px-2 font-semibold text-primary">Receita</th>
                            <th className="text-right py-3 px-2 font-semibold text-primary">Ordens</th>
                            <th className="text-right py-3 px-2 font-semibold text-primary">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.map((entry, index) => (
                            <tr
                              key={entry.userId}
                              className={`border-b transition-colors ${
                                entry.userId === user?.id
                                  ? "bg-primary/10 hover:bg-primary/15"
                                  : "hover:bg-primary/5"
                              }`}
                            >
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  {entry.position <= 3 && getMedalIcon(entry.position)}
                                  <span className="font-semibold">#{entry.position}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2 font-medium">
                                {entry.userName}
                                {entry.userId === user?.id && <span className="text-primary ml-2">(Você)</span>}
                              </td>
                              <td className="text-right py-3 px-2">{formatCurrency(entry.totalRevenue)}</td>
                              <td className="text-right py-3 px-2">{entry.orderCount}</td>
                              <td className="text-right py-3 px-2 font-bold text-accent">
                                {parseFloat(entry.score).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhum dado de ranking para este período</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
