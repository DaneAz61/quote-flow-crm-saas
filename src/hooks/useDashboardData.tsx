
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
        // Since we don't have the CRM tables yet, we'll return placeholder values
        // This will allow the app to build while the database is being updated
        
        setCustomerCount(0);
        setQuoteCount(0);
        setLeadCount(0);
        setTotalAmount(0);
        
        // Display a toast message to let the user know that CRM functionality isn't available yet
        toast({
          title: "CRM functionality unavailable",
          description: "The CRM tables need to be created in your database to use this feature.",
          variant: "destructive"
        });
        
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
