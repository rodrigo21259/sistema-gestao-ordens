import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface CustomField {
  id: number;
  name: string;
  type: string;
  options?: string | unknown;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface User {
  id: number;
  name?: string | null;
  email?: string | null;
  role: string;
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

export default function OrderForm() {
  const { user } = useAuth();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    clientCode: "",
    product: "",
    volume: "",
    revenue: "",
  });
  const [customValues, setCustomValues] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data: fields } = trpc.customFields.listActive.useQuery();
  const { data: allUsers } = trpc.users.listAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const createOrderMutation = trpc.orders.create.useMutation();
  const listOrdersMutation = trpc.orders.listByUser.useQuery();
  const deleteOrderMutation = trpc.orders.delete.useMutation();

  useEffect(() => {
    if (fields) {
      setCustomFields(fields);
    }
  }, [fields]);

  useEffect(() => {
    if (allUsers && user?.role === "admin") {
      setUsers(allUsers);
      if (!selectedUserId && user?.id) {
        setSelectedUserId(String(user.id));
      }
    }
  }, [allUsers, user?.role, user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomValueChange = (fieldId: number, value: string) => {
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const customValuesArray = customFields.map((field) => ({
        fieldId: field.id,
        value: customValues[field.id] || null,
      }));

      await createOrderMutation.mutateAsync({
        ...formData,
        customValues: customValuesArray,
        targetUserId: selectedUserId ? parseInt(selectedUserId) : undefined,
      });

      toast.success("Ordem registrada com sucesso!");
      setFormData({ clientCode: "", product: "", volume: "", revenue: "" });
      setCustomValues({});
      listOrdersMutation.refetch();
    } catch (error) {
      toast.error("Erro ao registrar ordem");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      await deleteOrderMutation.mutateAsync({ orderId });
      toast.success("Ordem deletada com sucesso!");
      listOrdersMutation.refetch();
    } catch (error) {
      toast.error("Erro ao deletar ordem");
      console.error(error);
    }
  };

  const renderCustomField = (field: CustomField) => {
    const value = customValues[field.id] || "";

    switch (field.type) {
      case "TEXT":
        return (
          <Input
            key={field.id}
            placeholder={field.name}
            value={value}
            onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
          />
        );
      case "NUMBER":
        return (
          <Input
            key={field.id}
            type="number"
            placeholder={field.name}
            value={value}
            onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
          />
        );
      case "BOOLEAN":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.id}`}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleCustomValueChange(field.id, checked ? "true" : "false")
              }
            />
            <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
          </div>
        );
      case "DROPDOWN":
        const options = field.options ? (typeof field.options === 'string' ? JSON.parse(field.options) : field.options) : [];
        return (
          <Select key={field.id} value={value} onValueChange={(v) => handleCustomValueChange(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder={field.name} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Registrar Nova Ordem</CardTitle>
                  <CardDescription>Preencha os dados da ordem de venda</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {user?.role === "admin" && users.length > 0 && (
                  <div>
                    <Label htmlFor="operador">Registrar para (Operador)</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um operador" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name || u.email} {u.id === user?.id ? "(Você)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCode">Código do Cliente *</Label>
                    <Input
                      id="clientCode"
                      name="clientCode"
                      placeholder="Ex: CLI001"
                      value={formData.clientCode}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product">Produto *</Label>
                    <Select
                      value={formData.product}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, product: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                        <SelectItem value="Renda Variável">Renda Variável</SelectItem>
                        <SelectItem value="Fundos">Fundos</SelectItem>
                        <SelectItem value="Alternativos">Alternativos</SelectItem>
                        <SelectItem value="Prev">Prev</SelectItem>
                        <SelectItem value="COE">COE</SelectItem>
                        <SelectItem value="Internacional">Internacional</SelectItem>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="Iris">Iris</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="volume">Volume (R$) *</Label>
                    <Input
                      id="volume"
                      name="volume"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 1500.00"
                      value={formData.volume}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue">Receita (R$) *</Label>
                    <Input
                      id="revenue"
                      name="revenue"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 1500.00"
                      value={formData.revenue}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {customFields.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm text-primary">Campos Adicionais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customFields.map((field) => (
                        <div key={field.id}>{renderCustomField(field)}</div>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full h-10 text-base font-semibold">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrar Ordem
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
              <CardTitle>Minhas Ordens</CardTitle>
              <CardDescription>Histórico de ordens registradas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {listOrdersMutation.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : listOrdersMutation.data && listOrdersMutation.data.length > 0 ? (
                <div className="space-y-3">
                  {listOrdersMutation.data.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{order.product}</p>
                        <p className="text-sm text-muted-foreground">
                          Cliente: {order.clientCode} | Volume: {formatCurrency(order.volume)} | Receita: {formatCurrency(order.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                          {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Nenhuma ordem registrada ainda</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
