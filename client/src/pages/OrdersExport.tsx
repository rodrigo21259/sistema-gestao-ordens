import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Download, Calendar } from "lucide-react";

export default function OrdersExport() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = trpc.orders.exportCSV.useQuery(
    {
      month: selectedMonth ? parseInt(selectedMonth) : undefined,
      year: selectedYear ? parseInt(selectedYear) : undefined,
    },
    {
      enabled: false,
    }
  );

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

  const handleExport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Selecione mês e ano");
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportMutation.refetch();
      
      if (result.data?.csv) {
        const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", result.data.fileName);
        link.style.visibility = "hidden";
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Ordens exportadas com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar ordens");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Exportar Ordens</CardTitle>
              <CardDescription>Baixe todas as ordens em formato CSV</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um mês" />
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
                    <SelectValue placeholder="Selecione um ano" />
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

            <Button
              onClick={handleExport}
              disabled={isExporting || !selectedMonth || !selectedYear}
              className="w-full"
              size="lg"
            >
              {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Informações sobre Exportação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold text-sm mb-2">📊 Formato CSV</p>
            <p className="text-sm text-muted-foreground">
              O arquivo será exportado em formato CSV (valores separados por vírgula), compatível com Excel, Google Sheets e outras ferramentas.
            </p>
          </div>
          <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
            <p className="font-semibold text-sm mb-2">📅 Período</p>
            <p className="text-sm text-muted-foreground">
              Selecione o mês e ano desejado. O arquivo incluirá todas as ordens registradas naquele período.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold text-sm mb-2">📋 Colunas Incluídas</p>
            <p className="text-sm text-muted-foreground">
              ID, Operador, Cliente, Produto, Volume, Receita e Data de Registro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
