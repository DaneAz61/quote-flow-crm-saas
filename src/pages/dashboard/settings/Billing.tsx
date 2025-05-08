
import { useEffect, useState } from 'react';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { createCheckoutSession, createCustomerPortal } from "@/lib/stripe/subscription";

const Billing = () => {
  const { toast } = useToast();
  const { user, subscription, refreshSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    // Refresh subscription data when component mounts
    refreshSubscription();
  }, [refreshSubscription]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const url = await createCheckoutSession();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Não foi possível criar a sessão de checkout");
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao iniciar assinatura',
        description: 'Não foi possível redirecionar para o checkout do Stripe.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const url = await createCustomerPortal();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Não foi possível acessar o portal de gerenciamento");
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao gerenciar assinatura',
        description: 'Não foi possível redirecionar para o portal do Stripe.'
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Faturamento</h1>
        
        <div className="grid gap-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Sua Assinatura Atual</CardTitle>
              <CardDescription>
                Informações sobre seu plano atual e status da assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-medium">Plano</div>
                  <div>
                    {subscription?.subscribed ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {subscription.subscription_tier || "Premium"}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        Gratuito
                      </span>
                    )}
                  </div>
                </div>
                
                {subscription?.subscribed && (
                  <>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Status</div>
                      <div>
                        <span className="text-green-600">Ativo</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Próxima cobrança</div>
                      <div>
                        {subscription.subscription_end ? (
                          new Date(subscription.subscription_end).toLocaleDateString('pt-BR')
                        ) : (
                          "Não disponível"
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {!subscription?.subscribed && (
                  <div className="text-amber-600 bg-amber-50 p-4 rounded-md text-sm mt-4">
                    <div className="font-medium mb-1">Plano Gratuito - Limitações:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Máximo de 5 orçamentos</li>
                      <li>PDFs com marca d'água</li>
                      <li>Sem acesso ao CRM completo</li>
                      <li>Sem recursos avançados de IA</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              {subscription?.subscribed ? (
                <Button 
                  onClick={handleManageSubscription} 
                  disabled={isPortalLoading}
                >
                  {isPortalLoading ? "Carregando..." : "Gerenciar Assinatura"}
                </Button>
              ) : (
                <Button 
                  onClick={handleSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? "Carregando..." : "Atualizar para Premium"}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Pricing Plans */}
          {!subscription?.subscribed && (
            <Card>
              <CardHeader>
                <CardTitle>Plano Premium</CardTitle>
                <CardDescription>
                  Desbloqueie todos os recursos com o plano Premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Orçamentos ilimitados</span>
                  </div>
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>PDFs personalizados com sua marca</span>
                  </div>
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>CRM completo com kanban</span>
                  </div>
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Geração avançada com IA</span>
                  </div>
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Até 5 usuários</span>
                  </div>
                  <div className="flex items-center">
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
                      className="h-5 w-5 text-green-500 mr-2"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Suporte prioritário</span>
                  </div>
                </div>
                
                <div className="mt-8 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">R$9,90/mês</div>
                    <Button onClick={handleSubscribe} disabled={isLoading}>
                      {isLoading ? "Carregando..." : "Assinar agora"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Invoice History */}
          {subscription?.subscribed && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Faturas</CardTitle>
                <CardDescription>
                  Acesse suas faturas anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  O histórico completo de faturas está disponível no portal do cliente Stripe.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={handleManageSubscription} disabled={isPortalLoading}>
                  Ver histórico de faturas
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
