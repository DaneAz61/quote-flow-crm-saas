
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
      const planName = priceData.nickname || "premium-mensal";
      
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
      
      // Log activity
      await supabaseClient.from("activity_log").insert({
        entity_type: "subscription",
        entity_id: userData.id,
        action: "subscription_created",
        actor_id: userData.id,
        data: {
          subscription_id: subscription.id,
          plan: planName,
          status: subscription.status
        }
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
      
      // Log activity
      await supabaseClient.from("activity_log").insert({
        entity_type: "subscription",
        entity_id: userData.id,
        action: "subscription_updated",
        actor_id: userData.id,
        data: {
          subscription_id: subscription.id,
          status: subscription.status
        }
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
      
      // Log activity
      await supabaseClient.from("activity_log").insert({
        entity_type: "subscription",
        entity_id: userData.id,
        action: "subscription_canceled",
        actor_id: userData.id,
        data: {
          subscription_id: subscription.id
        }
      });
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
      
      // If this is a subscription invoice, update the subscription
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        
        await supabaseClient
          .from("subscriptions")
          .update({
            status: "active",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      
      // Log activity
      await supabaseClient.from("activity_log").insert({
        entity_type: "invoice",
        entity_id: userData.id,
        action: "invoice_paid",
        actor_id: userData.id,
        data: {
          invoice_id: invoice.id,
          amount_paid: invoice.amount_paid / 100,
          currency: invoice.currency
        }
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
      
      // If this is a subscription invoice, update the subscription
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        
        await supabaseClient
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      
      // Log activity
      await supabaseClient.from("activity_log").insert({
        entity_type: "invoice",
        entity_id: userData.id,
        action: "invoice_payment_failed",
        actor_id: userData.id,
        data: {
          invoice_id: invoice.id,
          attempt_count: invoice.attempt_count
        }
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
