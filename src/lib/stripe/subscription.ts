
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string | null;
  subscription_end?: string | null;
}

export async function checkSubscription(): Promise<SubscriptionData> {
  try {
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      method: 'POST',
    });

    if (error) {
      console.error("Error checking subscription:", error);
      return { subscribed: false };
    }

    return data;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return { subscribed: false };
  }
}

/**
 * Creates a Stripe checkout session for subscription
 * Uses dynamic price data configured in the Edge Function (R$9,90/month)
 */
export async function createCheckoutSession(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      method: 'POST',
    });

    if (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão de checkout",
        variant: "destructive",
      });
      return null;
    }

    if (!data?.url) {
      console.error("No URL returned from checkout session");
      toast({
        title: "Erro",
        description: "URL de checkout não encontrada",
        variant: "destructive",
      });
      return null;
    }

    return data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao criar a sessão de checkout",
      variant: "destructive",
    });
    return null;
  }
}

export async function createCustomerPortal(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      method: 'POST',
    });

    if (error) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão do portal do cliente",
        variant: "destructive",
      });
      return null;
    }

    if (!data?.url) {
      console.error("No URL returned from customer portal session");
      toast({
        title: "Erro",
        description: "URL do portal do cliente não encontrada",
        variant: "destructive",
      });
      return null;
    }

    return data.url;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao criar a sessão do portal do cliente",
      variant: "destructive",
    });
    return null;
  }
}
