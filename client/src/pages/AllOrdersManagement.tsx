import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Search } from "lucide-react";

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

export default function AllOrdersManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allOrders, isLoading, refetch } = trpc.orders.listAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-center text-destructive font-semibold">Acesso negado. Apenas administradores podem acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm("Tem certeza que deseja deletar esta ordem?")) {
      return;
    }

    try {
      await deleteOrderMutation.mutateAsync({ orderId });
      toast.success("Ordem deletada com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao deletar ordem");
      console.error(error);
    }
  };

  const filteredOrders = allOrders?.filter((order: any) =>
    order.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Gerenciar Todas as Ordens</h1>
            <p className="text-muted-foreground">Visualize e delete ordens de todos os operadores</p>
          </div>

          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Buscar Ordens
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div>
                <Label htmlFor="search">Buscar por cliente, produto ou operador</Label>
                <Input
                  id="search"
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle>Lista de Ordens</CardTitle>
              <CardDescription>Total: {filteredOrders.length} ordem(ns)</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary/20">
                        <th className="text-left py-3 px-2 font-semibold text-primary">Operador</th>
                        <th className="text-left py-3 px-2 font-semibold text-primary">Cliente</th>
                        <th className="text-left py-3 px-2 font-semibold text-primary">Produto</th>
                        <th className="text-right py-3 px-2 font-semibold text-primary">Volume</th>
                        <th className="text-right py-3 px-2 font-semibold text-primary">Receita</th>
                        <th className="text-left py-3 px-2 font-semibold text-primary">Data</th>
                        <th className="text-center py-3 px-2 font-semibold text-primary">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order: any) => (
                        <tr key={order.id} className="border-b hover:bg-primary/5 transition-colors">
                          <td className="py-3 px-2 font-medium">{order.userName}</td>
                          <td className="py-3 px-2">{order.clientCode}</td>
                          <td className="py-3 px-2">{order.product}</td>
                          <td className="text-right py-3 px-2">{formatCurrency(order.volume)}</td>
                          <td className="text-right py-3 px-2 font-semibold">{formatCurrency(order.revenue)}</td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleteOrderMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Nenhuma ordem encontrada com os critérios de busca" : "Nenhuma ordem registrada"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
