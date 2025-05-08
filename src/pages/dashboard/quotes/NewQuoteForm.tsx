
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
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
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { id: crypto.randomUUID(), description: "", qty: 1, unit_price: 0 }
  ]);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGptGenerating, setIsGptGenerating] = useState(false);
  const [gptPrompt, setGptPrompt] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, company_name')
          .eq('owner_id', user.id)
          .order('company_name');
        
        if (error) throw error;
        
        setCustomers(data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar clientes',
          description: 'Não foi possível carregar a lista de clientes.'
        });
      }
    };
    
    fetchCustomers();
  }, [user, toast]);

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
      
      // Get customer details
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', selectedCustomerId)
        .single();
      
      if (customerError) throw customerError;
      
      // Build the prompt for GPT
      const prompt = buildQuotePrompt({
        customer: customerData,
        existingItems: quoteItems.filter(item => item.description.trim() !== ""),
        notes: notes
      });
      
      setGptPrompt(prompt);
      
      // TODO: Call OpenAI API here and process the response
      // This is a placeholder for the API call
      console.log("GPT Prompt:", prompt);
      
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
      
    } catch (error) {
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
      // Calculate total amount
      const totalAmount = calculateTotal();
      
      // Check if user can create a quote (premium check or quote count check)
      if (!subscription?.subscribed) {
        const { count } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user?.id);
          
        if ((count || 0) >= 5) {
          toast({
            variant: 'destructive',
            title: 'Limite de orçamentos atingido',
            description: 'Seu plano gratuito permite apenas 5 orçamentos. Atualize para o plano Premium para criar mais orçamentos.'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Insert quote
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          customer_id: selectedCustomerId,
          owner_id: user?.id as string,
          status: 'draft',
          amount_total: totalAmount,
          currency: 'BRL'
        })
        .select()
        .single();
      
      if (quoteError) throw quoteError;
      
      // Insert quote items
      const quoteItemsToInsert = quoteItems.map(item => ({
        quote_id: quoteData.id,
        description: item.description,
        qty: item.qty,
        unit_price: item.unit_price
      }));
      
      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItemsToInsert);
      
      if (itemsError) throw itemsError;
      
      // Create CRM lead
      const { data: stagesData } = await supabase
        .from('crm_stages')
        .select('id')
        .eq('position', 1)
        .single();
        
      const initialStageId = stagesData?.id;
      
      if (initialStageId) {
        await supabase
          .from('crm_leads')
          .insert({
            quote_id: quoteData.id,
            stage_id: initialStageId,
            notes: notes || null
          });
      }
      
      // Call API to generate PDF
      const { data: pdfData, error: pdfError } = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId: quoteData.id,
        }),
      }).then(res => res.json());
      
      if (pdfError) {
        console.error('Error generating PDF:', pdfError);
      }
      
      // Update quote with PDF URL if available
      if (pdfData?.pdfUrl) {
        await supabase
          .from('quotes')
          .update({ pdf_url: pdfData.pdfUrl })
          .eq('id', quoteData.id);
      }
      
      // Log activity
      await supabase.from('activity_log').insert({
        entity_type: 'quote',
        entity_id: quoteData.id,
        action: 'create',
        actor_id: user?.id,
        data: { amount_total: totalAmount }
      });
      
      toast({
        title: 'Orçamento criado',
        description: 'Orçamento criado com sucesso!'
      });
      
      // Navigate to quote detail
      navigate(`/dashboard/quotes/${quoteData.id}`);
      
    } catch (error) {
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

                    {customers.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum cliente cadastrado.{" "}
                        <Button variant="link" className="p-0 h-auto" asChild>
                          <a href="/dashboard/customers/new">Cadastrar novo cliente</a>
                        </Button>
                      </p>
                    )}
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
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard/quotes")}>
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
