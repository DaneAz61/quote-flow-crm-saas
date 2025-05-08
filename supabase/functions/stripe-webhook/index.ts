
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Configure o webhook para não verificar JWT (permitir acesso público)
// Isso é necessário para que o Stripe possa enviar eventos para o webhook

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Webhook secret key for verifying webhook events
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// Create a Supabase client with the service role key
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

interface EventHandlers {
  [key: string]: (event: Stripe.Event) => Promise<void>;
}

// Helper para logs mais legíveis
const logEvent = (eventType: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK] ${eventType}${detailsStr}`);
};

// Event handlers for different webhook events
const eventHandlers: EventHandlers = {
  "customer.subscription.created": async (event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    try {
      // Get user associated with Stripe customer
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (userError) throw userError;
      
      // Get subscription plan details
      const priceId = subscription.items.data[0].price.id;
      const { data: priceData } = await stripe.prices.retrieve(priceId);
      const planName = priceData.nickname || "Premium";
      
      // Create or update subscription record
      await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: userData.id,
          stripe_subscription_id: subscription.id,
          plan: planName,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: "stripe_subscription_id" });
      
      logEvent("subscription.created", { 
        user_id: userData.id, 
        plan: planName, 
        status: subscription.status 
      });
    } catch (error) {
      console.error("Error handling subscription.created event:", error);
      throw error;
    }
  },
  
  "customer.subscription.updated": async (event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    try {
      // Get user associated with Stripe customer
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (userError) throw userError;
      
      // Update subscription record
      await supabaseClient
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      
      logEvent("subscription.updated", { 
        user_id: userData.id, 
        status: subscription.status, 
        end_date: new Date(subscription.current_period_end * 1000).toISOString() 
      });
    } catch (error) {
      console.error("Error handling subscription.updated event:", error);
      throw error;
    }
  },
  
  "customer.subscription.deleted": async (event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    try {
      // Get user associated with Stripe customer
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (userError) throw userError;
      
      // Update subscription record
      await supabaseClient
        .from("subscriptions")
        .update({
          status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);
      
      logEvent("subscription.canceled", { user_id: userData.id });
    } catch (error) {
      console.error("Error handling subscription.deleted event:", error);
      throw error;
    }
  },
  
  "invoice.paid": async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    
    try {
      // Get user associated with Stripe customer
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (userError) throw userError;
      
      // Se for uma fatura de assinatura, atualize o status da assinatura
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        
        await supabaseClient
          .from("subscriptions")
          .update({
            status: "active",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      
      logEvent("invoice.paid", { 
        user_id: userData.id, 
        invoice_id: invoice.id, 
        amount: invoice.amount_paid / 100,
        currency: invoice.currency
      });
    } catch (error) {
      console.error("Error handling invoice.paid event:", error);
      throw error;
    }
  },
  
  "invoice.payment_failed": async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    
    try {
      // Get user associated with Stripe customer
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();
      
      if (userError) throw userError;
      
      // Se for uma fatura de assinatura, atualize o status da assinatura
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        
        await supabaseClient
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      
      logEvent("invoice.payment_failed", { 
        user_id: userData.id, 
        invoice_id: invoice.id 
      });
    } catch (error) {
      console.error("Error handling invoice.payment_failed event:", error);
      throw error;
    }
  }
};

serve(async (req) => {
  if (req.method === "POST") {
    try {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        throw new Error("No Stripe signature found");
      }
      
      const body = await req.text();
      let event: Stripe.Event;
      
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }
      
      console.log(`Received event: ${event.type}`);
      
      // Handle the event
      const eventHandler = eventHandlers[event.type];
      if (eventHandler) {
        await eventHandler(event);
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // For events we're not handling
        return new Response(JSON.stringify({ received: true, handled: false }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  } else {
    return new Response("Method not allowed", { status: 405 });
  }
});
