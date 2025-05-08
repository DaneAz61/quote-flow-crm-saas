
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY is not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Verificar se temos o segredo do webhook configurado
    if (!webhookSecret) {
      logStep("WARNING: STRIPE_WEBHOOK_SECRET is not set, skipping signature verification");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe-signature header found");
      throw new Error("No stripe-signature header found");
    }

    // Obter o corpo da requisição como texto
    const body = await req.text();
    logStep("Request body obtained");

    let event;

    // Verificar a assinatura se tivermos o segredo do webhook
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep(`ERROR: Webhook signature verification failed - ${errorMessage}`);
        return new Response(`Webhook signature verification failed: ${errorMessage}`, { status: 400 });
      }
    } else {
      // Se não tivermos o segredo do webhook, confiar no corpo sem verificação
      try {
        event = JSON.parse(body);
        logStep("Event parsed without verification");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logStep(`ERROR: Invalid JSON payload - ${errorMessage}`);
        return new Response(`Invalid JSON payload: ${errorMessage}`, { status: 400 });
      }
    }

    logStep(`Event processed: ${event.type}`);

    // Processar eventos específicos aqui
    switch (event.type) {
      case 'customer.subscription.created':
        logStep('Subscription created event received', { subscription: event.data.object.id });
        break;
      case 'customer.subscription.updated':
        logStep('Subscription updated event received', { subscription: event.data.object.id });
        break;
      case 'customer.subscription.deleted':
        logStep('Subscription canceled event received', { subscription: event.data.object.id });
        break;
      case 'invoice.paid':
        logStep('Invoice paid event received', { invoice: event.data.object.id });
        break;
      case 'invoice.payment_failed':
        logStep('Payment failed event received', { invoice: event.data.object.id });
        break;
      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep(`ERROR: ${errorMessage}`);
    return new Response(`Webhook error: ${errorMessage}`, { status: 500 });
  }
});
