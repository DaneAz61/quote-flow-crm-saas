
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface DashboardData {
  customerCount: number;
  quoteCount: number;
  leadCount: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
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

  return {
    customerCount,
    quoteCount,
    leadCount,
    totalAmount,
    loading,
    error
  };
};
