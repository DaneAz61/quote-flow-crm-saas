
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import CrmKanban from "@/components/dashboard/CrmKanban";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const [customerCount, setCustomerCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          setError("Supabase environment variables are missing. Please set them in your .env file.");
          return;
        }

        // Get customer count
        const { count: customersCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        
        if (customersError) throw customersError;
        
        // Get quote count and total amount
        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('id, amount_total')
          .eq('owner_id', user.id);
        
        if (quotesError) throw quotesError;
        
        // Get lead count
        const { count: leadsCount, error: leadsError } = await supabase
          .from('crm_leads')
          .select('quotes!inner(owner_id)', { count: 'exact', head: true })
          .eq('quotes.owner_id', user.id);
        
        if (leadsError) throw leadsError;
        
        setQuoteCount(quotes?.length || 0);
        setTotalAmount(
          quotes?.reduce((sum, quote) => sum + (quote.amount_total || 0), 0) || 0
        );
        
        setCustomerCount(customersCount || 0);
        setLeadCount(leadsCount || 0);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError("Failed to fetch dashboard data. Please check your connection and try again.");
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: error.message || 'An unexpected error occurred'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Olá, {user?.email?.split('@')[0] || 'usuário'}! 
              {subscription?.subscribed ? (
                <span> | Plano: <span className="font-semibold">{subscription.subscription_tier}</span></span>
              ) : (
                <span> | Plano: Gratuito</span>
              )}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link to="/dashboard/quotes/new">Novo Orçamento</Link>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Configuration Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <p className="mt-2 text-sm">
                Please check the .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.
              </p>
            </CardContent>
          </Card>
        )}

        {!error && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Customer Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : customerCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {customerCount === 1 ? "cliente cadastrado" : "clientes cadastrados"}
                  </p>
                </CardContent>
              </Card>
              
              {/* Quote Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 7h10" />
                    <path d="M7 12h10" />
                    <path d="M7 17h5" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : quoteCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {quoteCount === 1 ? "orçamento criado" : "orçamentos criados"}
                  </p>
                </CardContent>
              </Card>
              
              {/* Leads Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads em Acompanhamento</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M4.93 4.93l2.83 2.83" />
                    <path d="M16.24 16.24l2.83 2.83" />
                    <path d="M2 12h4" />
                    <path d="M18 12h4" />
                    <path d="M4.93 19.07l2.83-2.83" />
                    <path d="M16.24 7.76l2.83-2.83" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : leadCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {leadCount === 1 ? "lead ativo" : "leads ativos"}
                  </p>
                </CardContent>
              </Card>
              
              {/* Total Amount Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20" />
                    <path d="m17 5-5-3-5 3" />
                    <path d="m17 19-5 3-5-3" />
                    <path d="M22 12H2" />
                    <path d="m5 7-3 5 3 5" />
                    <path d="m19 7 3 5-3 5" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : formatCurrency(totalAmount)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    valor dos orçamentos criados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CRM Kanban Board */}
            <Card className="p-0">
              <CardHeader>
                <CardTitle>Pipeline de Vendas</CardTitle>
                <CardDescription>
                  Acompanhe seus leads em cada estágio do funil de vendas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CrmKanban />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
