import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal } from "lucide-react";

interface RankingEntry {
  userId: number;
  userName: string;
  totalRevenue: string;
  orderCount: number;
  score: string;
  position: number;
}

export default function Ranking() {
  const { data: rankingData, isLoading } = trpc.ranking.getRanking.useQuery();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [currentUserScore, setCurrentUserScore] = useState<string>("0.00");

  useEffect(() => {
    if (rankingData) {
      setRanking(rankingData.ranking);
      setCurrentUserPosition(rankingData.currentUserPosition);
      setCurrentUserScore(rankingData.currentUserScore);
    }
  }, [rankingData]);

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getTopThreeClass = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-l-4 border-yellow-500";
    if (position === 2) return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-l-4 border-gray-400";
    if (position === 3) return "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-l-4 border-orange-600";
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUserPosition && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Sua Posição</p>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-4xl font-bold text-primary">#{currentUserPosition}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-semibold">{currentUserScore}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ranking de Operadores</CardTitle>
          <CardDescription>Posições atualizadas em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ranking.map((entry) => (
              <div
                key={entry.userId}
                className={`p-4 rounded-lg border transition-all ${
                  entry.position <= 3
                    ? getTopThreeClass(entry.position)
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 min-w-fit">
                      {getPositionBadge(entry.position)}
                      <span className="text-lg font-bold text-primary">#{entry.position}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.userName}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Receita: R$ {parseFloat(entry.totalRevenue).toFixed(2)}</span>
                        <span>Ordens: {entry.orderCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{entry.score}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>O ranking é calculado automaticamente com base em:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Receita total gerada pelas ordens</li>
            <li>Quantidade de ordens registradas</li>
            <li>Pesos configuráveis pelo administrador</li>
          </ul>
          <p className="pt-2">Os dados são atualizados em tempo real conforme novas ordens são registradas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
