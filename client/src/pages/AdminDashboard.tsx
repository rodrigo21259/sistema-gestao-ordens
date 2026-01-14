import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Users, Sliders, Grid3x3, Download, UserPlus, FileText } from "lucide-react";
import { Link } from "wouter";
import OrdersExport from "./OrdersExport";


export default function AdminDashboard() {
  const { user } = useAuth();
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"TEXT" | "NUMBER" | "BOOLEAN" | "DROPDOWN">("TEXT");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [newOperatorEmail, setNewOperatorEmail] = useState("");
  const [newOperatorName, setNewOperatorName] = useState("");

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
  const createOperatorMutation = trpc.users.createOperator.useMutation();

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

  // Função para extrair nome do email
  const extractNameFromEmail = (email: string) => {
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${firstName} ${lastName}`;
    }
    return email;
  };

  const handleEmailChange = (email: string) => {
    setNewOperatorEmail(email);
    if (email.includes("@")) {
      const extractedName = extractNameFromEmail(email);
      setNewOperatorName(extractedName);
    }
  };

  const handleCreateField = async () => {
    if (!newFieldName.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }

    try {
      await createFieldMutation.mutateAsync({
        name: newFieldName,
        type: newFieldType,
        options: newFieldType === "DROPDOWN" ? newFieldOptions.split(",").map((o) => o.trim()) : undefined,
      });

      toast.success("Campo criado com sucesso!");
      setNewFieldName("");
      setNewFieldType("TEXT");
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
      toast.success("Usuário promovido a admin!");
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

  const handleCreateOperator = async () => {
    if (!newOperatorEmail.trim() || !newOperatorName.trim()) {
      toast.error("Email e nome são obrigatórios");
      return;
    }

    if (!newOperatorEmail.toLowerCase().endsWith("@investsmart.com.br")) {
      toast.error("O email deve ser da empresa Investsmart (@investsmart.com.br)");
      return;
    }

    try {
      await createOperatorMutation.mutateAsync({
        email: newOperatorEmail,
        name: newOperatorName,
      });

      toast.success("Operador criado com sucesso!");
      setNewOperatorEmail("");
      setNewOperatorName("");
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar operador");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
            <Link href="/admin/orders">
              <Button className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Gerenciar Ordens
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="fields" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Campos
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Métricas
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </TabsTrigger>
            </TabsList>

            {/* Aba Usuários */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Criar Novo Operador
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email da Empresa *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Ex: rodrigo.vignoli@investsmart.com.br"
                        value={newOperatorEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Deve ser um email @investsmart.com.br. O nome será extraído automaticamente</p>
                    </div>
                    <div>
                      <Label htmlFor="name">Nome (Automático) *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nome será preenchido automaticamente"
                        value={newOperatorName}
                        onChange={(e) => setNewOperatorName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleCreateOperator} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Operador
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle>Lista de Usuários</CardTitle>
                  <CardDescription>Gerencie roles e permissões</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {users && users.length > 0 ? (
                    <div className="space-y-3">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                          <div>
                            <p className="font-semibold">{u.name || u.email}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-primary font-medium mt-1">
                              {u.role === "admin" ? "👤 Administrador" : "👥 Operador"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {u.role === "admin" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDemoteUser(u.id)}
                              >
                                Rebaixar
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handlePromoteUser(u.id)}
                              >
                                Promover
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Campos */}
            <TabsContent value="fields" className="space-y-6">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Criar Novo Campo
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fieldName">Nome do Campo *</Label>
                      <Input
                        id="fieldName"
                        placeholder="Ex: Observações"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fieldType">Tipo *</Label>
                      <Select value={newFieldType} onValueChange={(value: any) => setNewFieldType(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Texto</SelectItem>
                          <SelectItem value="NUMBER">Número</SelectItem>
                          <SelectItem value="BOOLEAN">Sim/Não</SelectItem>
                          <SelectItem value="DROPDOWN">Lista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newFieldType === "DROPDOWN" && (
                      <div>
                        <Label htmlFor="options">Opções (separadas por vírgula)</Label>
                        <Input
                          id="options"
                          placeholder="Ex: Opção 1, Opção 2, Opção 3"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button onClick={handleCreateField} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Campo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle>Campos Dinâmicos</CardTitle>
                  <CardDescription>Campos adicionais no formulário de ordens</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {customFields && customFields.length > 0 ? (
                    <div className="space-y-3">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                          <div>
                            <p className="font-semibold">{field.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {field.type === "TEXT" ? "Texto" : field.type === "NUMBER" ? "Número" : field.type === "BOOLEAN" ? "Sim/Não" : "Lista"}
                            </p>
                            {field.options && typeof field.options !== 'undefined' ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                Opções: {Array.isArray(field.options) ? (field.options as string[]).join(", ") : String(field.options)}
                              </p>
                            ) : null}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteField(field.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhum campo dinâmico criado</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Métricas */}
            <TabsContent value="metrics" className="space-y-6">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
                  <CardTitle>Configurar Métricas de Ranking</CardTitle>
                  <CardDescription>Ajuste os pesos das métricas que calculam o ranking</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {rankingMetrics && rankingMetrics.length > 0 ? (
                    <div className="space-y-6">
                      {rankingMetrics.map((metric) => (
                        <div key={metric.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-semibold">
                              {metric.metricName === "revenue" ? "Receita" : "Quantidade de Ordens"}
                            </Label>
                            <span className="text-sm text-muted-foreground">Peso atual: {metric.weight}%</span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={metric.weight}
                              onBlur={(e) => {
                                const value = e.target.value;
                                if (value && value !== metric.weight.toString()) {
                                  handleUpdateMetric(metric.id, value);
                                }
                              }}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground pt-2">%</span>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          💡 Dica: Os pesos devem somar 100% para um cálculo equilibrado do ranking.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-muted-foreground">Nenhuma métrica configurada</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Exportar */}
            <TabsContent value="export">
              <OrdersExport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
