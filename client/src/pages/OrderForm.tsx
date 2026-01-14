import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

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

  useEffect(() => {
    if (fields) {
      setCustomFields(fields);
    }
  }, [fields]);

  useEffect(() => {
    if (allUsers && user?.role === "admin") {
      setUsers(allUsers);
      if (!selectedUserId && allUsers.length > 0) {
        setSelectedUserId(String(user?.id));
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
    <div className="space-y-6">
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
                <Input
                  id="product"
                  name="product"
                  placeholder="Ex: Produto A"
                  value={formData.product}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume *</Label>
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  step="0.0001"
                  placeholder="Ex: 100.5"
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-3 px-2 font-semibold text-primary">Cliente</th>
                    <th className="text-left py-3 px-2 font-semibold text-primary">Produto</th>
                    <th className="text-right py-3 px-2 font-semibold text-primary">Volume</th>
                    <th className="text-right py-3 px-2 font-semibold text-primary">Receita</th>
                    <th className="text-left py-3 px-2 font-semibold text-primary">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {listOrdersMutation.data.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-2">{order.clientCode}</td>
                      <td className="py-3 px-2">{order.product}</td>
                      <td className="text-right py-3 px-2">{order.volume}</td>
                      <td className="text-right py-3 px-2 font-semibold">R$ {parseFloat(order.revenue).toFixed(2)}</td>
                      <td className="py-3 px-2 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Nenhuma ordem registrada ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
