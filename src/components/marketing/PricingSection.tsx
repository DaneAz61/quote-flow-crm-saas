
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onGetStarted: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  return (
    <section id="pricing" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio. Sem contratos longos, cancele a qualquer momento.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-8">
            <h3 className="text-2xl font-bold mb-2">Básico</h3>
            <div className="text-sm text-muted-foreground mb-6">Para pequenas empresas e freelancers</div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold">Grátis</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Até 5 orçamentos por mês</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>PDFs básicos</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>CRM simplificado</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>1 usuário</span>
              </li>
            </ul>
            
            <Button onClick={onGetStarted} variant="outline" className="w-full">
              Começar gratuitamente
            </Button>
          </div>
          
          {/* Premium Plan */}
          <div className="bg-card rounded-lg border border-primary shadow-md p-8 relative">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
              Recomendado
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-sm text-muted-foreground mb-6">Para empresas em crescimento</div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold">R$99</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Orçamentos ilimitados</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>PDFs personalizados com sua marca</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>CRM completo com kanban</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Geração avançada com IA</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Até 5 usuários</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
            
            <Button onClick={onGetStarted} className="w-full">
              Começar agora
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-10 text-muted-foreground">
          Precisa de mais recursos? <a href="/contact" className="text-primary hover:underline">Entre em contato</a> para um plano personalizado.
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
