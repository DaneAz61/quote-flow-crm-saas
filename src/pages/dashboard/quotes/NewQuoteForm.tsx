
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { buildQuotePrompt } from "@/lib/gpt/quoteBuilder";

interface Customer {
  id: string;
  company_name: string;
}

interface QuoteItem {
  id: string;
  description: string;
  qty: number;
  unit_price: number;
}

const NewQuoteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, subscription } = useAuth();
  
  // Updated to include empty array as default state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: crypto.randomUUID(), description: "", qty: 1, unit_price: 0 }
  ]);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGptGenerating, setIsGptGenerating] = useState(false);
  const [gptPrompt, setGptPrompt] = useState<string>("");

  const addQuoteItem = () => {
    setQuoteItems([
      ...quoteItems,
      { id: crypto.randomUUID(), description: "", qty: 1, unit_price: 0 }
    ]);
  };

  const removeQuoteItem = (id: string) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter(item => item.id !== id));
    }
  };

  const updateQuoteItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(
      quoteItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotal = () => {
    return quoteItems.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
  };

  const handleGenerateWithGpt = async () => {
    if (!selectedCustomerId) {
      toast({
        variant: 'destructive',
        title: 'Cliente não selecionado',
        description: 'Por favor, selecione um cliente antes de gerar o orçamento.'
      });
      return;
    }
    
    try {
      setIsGptGenerating(true);
      
      // In a real app, we would get customer details
      // Fixed the mock data to include id
      const customerData = { 
        id: selectedCustomerId,
        company_name: "Example Company" 
      };
      
      // Build the prompt for GPT
      const prompt = buildQuotePrompt({
        customer: customerData,
        existingItems: quoteItems.filter(item => item.description.trim() !== ""),
        notes: notes
      });
      
      setGptPrompt(prompt);
      
      // Mock GPT response for demonstration
      setTimeout(() => {
        const mockItems = [
          { 
            id: crypto.randomUUID(), 
            description: "Consultoria estratégica personalizada para análise de mercado", 
            qty: 1, 
            unit_price: 3500 
          },
          { 
            id: crypto.randomUUID(), 
            description: "Desenvolvimento de plano de negócios detalhado", 
            qty: 1, 
            unit_price: 2800 
          },
          { 
            id: crypto.randomUUID(), 
            description: "Sessões de mentoria executiva (pacote de 5 sessões)", 
            qty: 1, 
            unit_price: 4500 
          }
        ];
        
        setQuoteItems(mockItems);
        setNotes("Este orçamento inclui nossa consultoria completa de estratégia de negócios, personalizada para as necessidades específicas da sua empresa. Todas as sessões de mentoria podem ser agendadas conforme sua conveniência ao longo de um período de 3 meses.");
        
        toast({
          title: 'Orçamento gerado',
          description: 'Itens do orçamento foram gerados com sucesso! Ajuste conforme necessário.'
        });
        
        setIsGptGenerating(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error generating quote with GPT:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar orçamento',
        description: 'Não foi possível gerar o orçamento automaticamente.'
      });
      setIsGptGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId) {
      toast({
        variant: 'destructive',
        title: 'Cliente não selecionado',
        description: 'Por favor, selecione um cliente antes de criar o orçamento.'
      });
      return;
    }
    
    if (quoteItems.some(item => !item.description.trim())) {
      toast({
        variant: 'destructive',
        title: 'Itens incompletos',
        description: 'Todos os itens do orçamento devem ter uma descrição.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would create a quote in the database
      // For now, display a toast message about missing tables
      
      toast({
        title: "Tables required",
        description: "The required database tables need to be created to use this feature.",
        variant: "destructive"
      });
      
      // Navigate back to dashboard
      navigate(`/dashboard`);
      
    } catch (error: any) {
      console.error('Error creating quote:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar orçamento',
        description: 'Não foi possível criar o orçamento.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Novo Orçamento</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
                <CardDescription>
                  Selecione o cliente para este orçamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="text-sm text-muted-foreground">
                      Para usar esta funcionalidade, os bancos de dados necessários precisam ser criados.{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto" 
                        onClick={() => {
                          toast({
                            title: "Tabelas necessárias",
                            description: "As tabelas do banco de dados precisam ser criadas para utilizar esta funcionalidade."
                          });
                        }}
                      >
                        Saiba mais
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Orçamento</CardTitle>
                <CardDescription>
                  Adicione os produtos ou serviços que fazem parte deste orçamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {quoteItems.map((item, index) => (
                    <div key={item.id} className="grid gap-4 pt-4 first:pt-0 border-t first:border-0">
                      <div className="grid gap-2">
                        <Label htmlFor={`item-description-${index}`}>Descrição</Label>
                        <Textarea
                          id={`item-description-${index}`}
                          value={item.description}
                          onChange={(e) => updateQuoteItem(item.id, "description", e.target.value)}
                          placeholder="Descreva o produto ou serviço"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`item-qty-${index}`}>Quantidade</Label>
                          <Input
                            id={`item-qty-${index}`}
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => 
                              updateQuoteItem(
                                item.id, 
                                "qty", 
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`item-price-${index}`}>Preço Unitário (R$)</Label>
                          <Input
                            id={`item-price-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => 
                              updateQuoteItem(
                                item.id, 
                                "unit_price", 
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          Subtotal: <span className="font-medium">{formatCurrency(item.qty * item.unit_price)}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeQuoteItem(item.id)}
                          disabled={quoteItems.length === 1}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center">
                    <Button type="button" variant="outline" onClick={addQuoteItem}>
                      Adicionar Item
                    </Button>
                    <div className="text-lg font-medium">
                      Total: {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateWithGpt} 
                  disabled={!selectedCustomerId || isGptGenerating}
                  className="mr-auto"
                >
                  {isGptGenerating ? "Gerando..." : "Gerar com IA"}
                </Button>
              </CardFooter>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
                <CardDescription>
                  Adicione informações adicionais ao orçamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ex: Validade do orçamento, condições de pagamento, prazos de entrega..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Orçamento"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewQuoteForm;
