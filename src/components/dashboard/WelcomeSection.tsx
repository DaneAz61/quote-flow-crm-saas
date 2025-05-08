
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { SubscriptionData } from "@/lib/stripe/subscription";

interface WelcomeSectionProps {
  user: User | null;
  subscription: SubscriptionData | null;
}

const WelcomeSection = ({ user, subscription }: WelcomeSectionProps) => {
  return (
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
  );
};

export default WelcomeSection;
