import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users, Sliders, Grid3x3 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"TEXT" | "NUMBER" | "BOOLEAN" | "DROPDOWN">("TEXT");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  // Queries
  const { data: users, refetch: refetchUsers } = trpc.users.listAll.useQuery();
  const { data: customFields, refetch: refetchCustomFields } = trpc.customFields.listAll.useQuery();
  const { data: rankingMetrics, refetch: refetchMetrics } = trpc.ranking.getMetrics.useQuery();

  // Mutations
  const createFieldMutation = trpc.customFields.create.useMutation();
  const deleteFieldMutation = trpc.customFields.delete.useMutation();
  const updateMetricMutation = trpc.ranking.updateMetricWeight.useMutation();
  const promoteUserMutation = trpc.users.promoteToAdmin.useMutation();
  const demoteUserMutation = trpc.users.demoteToOperator.useMutation();

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-center text-destructive font-semibold">Acesso negado. Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateField = async () => {
    if (!newFieldName.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }

    try {
      const options = newFieldType === "DROPDOWN" && newFieldOptions.trim()
        ? newFieldOptions.split(",").map((o) => o.trim())
        : undefined;

      await createFieldMutation.mutateAsync({
        name: newFieldName,
        type: newFieldType,
        options,
      });

      toast.success("Campo criado com sucesso!");
      setNewFieldName("");
      setNewFieldOptions("");
      refetchCustomFields();
    } catch (error) {
      toast.error("Erro ao criar campo");
      console.error(error);
    }
  };

  const handleDeleteField = async (fieldId: number) => {
    try {
      await deleteFieldMutation.mutateAsync({ fieldId });
      toast.success("Campo deletado com sucesso!");
      refetchCustomFields();
    } catch (error) {
      toast.error("Erro ao deletar campo");
      console.error(error);
    }
  };

  const handleUpdateMetric = async (metricId: number, newWeight: string) => {
    try {
      await updateMetricMutation.mutateAsync({
        metricId,
        weight: newWeight,
      });
      toast.success("Métrica atualizada com sucesso!");
      refetchMetrics();
    } catch (error) {
      toast.error("Erro ao atualizar métrica");
      console.error(error);
    }
  };

  const handlePromoteUser = async (userId: number) => {
    try {
      await promoteUserMutation.mutateAsync({ userId });
      toast.success("Usuário promovido a administrador!");
      refetchUsers();
    } catch (error) {
      toast.error("Erro ao promover usuário");
      console.error(error);
    }
  };

  const handleDemoteUser = async (userId: number) => {
    try {
      await demoteUserMutation.mutateAsync({ userId });
      toast.success("Usuário rebaixado a operador!");
      refetchUsers();
    } catch (error) {
      toast.error("Erro ao rebaixar usuário");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
        <h1 className="text-3xl font-bold text-primary mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie usuários, campos dinâmicos e métricas de ranking</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            <span className="hidden sm:inline">Campos</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
        </TabsList>

        {/* Usuários */}
        <TabsContent value="users">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription>Visualize e gerencie os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!users ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-semibold">{u.name || u.email}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          u.role === "admin"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {u.role === "admin" ? "Admin" : "Operador"}
                        </span>
                        {u.role === "admin" && u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDemoteUser(u.id)}
                            className="text-xs"
                          >
                            Rebaixar
                          </Button>
                        )}
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            onClick={() => handlePromoteUser(u.id)}
                            className="text-xs"
                          >
                            Promover
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campos Dinâmicos */}
        <TabsContent value="fields">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5 text-primary" />
                Campos Dinâmicos
              </CardTitle>
              <CardDescription>Crie e gerencie campos personalizados no formulário de ordens</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Campo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Campo</DialogTitle>
                    <DialogDescription>Adicione um novo campo ao formulário de ordens</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fieldName">Nome do Campo</Label>
                      <Input
                        id="fieldName"
                        placeholder="Ex: Canal de Venda"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">Tipo de Campo</Label>
                      <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Texto</SelectItem>
                          <SelectItem value="NUMBER">Número</SelectItem>
                          <SelectItem value="BOOLEAN">Booleano (Sim/Não)</SelectItem>
                          <SelectItem value="DROPDOWN">Dropdown (Seleção)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newFieldType === "DROPDOWN" && (
                      <div>
                        <Label htmlFor="fieldOptions">Opções (separadas por vírgula)</Label>
                        <Input
                          id="fieldOptions"
                          placeholder="Ex: Opção 1, Opção 2, Opção 3"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button onClick={handleCreateField} disabled={createFieldMutation.isPending} className="w-full">
                      {createFieldMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Criar Campo
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {!customFields ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-semibold">{field.name}</p>
                        <p className="text-sm text-muted-foreground">{field.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          field.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}>
                          {field.isActive ? "Ativo" : "Inativo"}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteField(field.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas de Ranking */}
        <TabsContent value="metrics">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                Métricas de Ranking
              </CardTitle>
              <CardDescription>Configure os pesos das métricas que compõem o ranking</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!rankingMetrics ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {rankingMetrics.map((metric) => (
                    <div key={metric.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold capitalize">
                          {metric.metricName === "revenue" ? "💰 Receita" : "📊 Quantidade de Ordens"}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          metric.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}>
                          {metric.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`weight-${metric.id}`} className="min-w-fit">Peso:</Label>
                        <Input
                          id={`weight-${metric.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          defaultValue={metric.weight}
                          onBlur={(e) => handleUpdateMetric(metric.id, e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-fit">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
