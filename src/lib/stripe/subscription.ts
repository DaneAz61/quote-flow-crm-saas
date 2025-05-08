import { supabase } from "@/integrations/supabase/client";

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

export async function createCheckoutSession(): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      method: 'POST',
    });

    if (error) {
      console.error("Error creating checkout session:", error);
      return null;
    }

    return data.url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
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
      return null;
    }

    return data.url;
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return null;
  }
}
