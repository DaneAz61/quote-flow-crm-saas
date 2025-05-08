
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Geração de orçamentos com IA",
    description: "Crie orçamentos detalhados e personalizados em segundos com nossa tecnologia de IA avançada.",
    icon: "✨"
  },
  {
    title: "PDFs profissionais",
    description: "Gere documentos de alta qualidade prontos para enviar aos seus clientes, com sua marca e detalhes.",
    icon: "📄"
  },
  {
    title: "CRM integrado",
    description: "Gerencie todo o ciclo de vendas em um único lugar com nosso sistema Kanban de fácil utilização.",
    icon: "📊"
  },
  {
    title: "Gerenciamento de clientes",
    description: "Mantenha todos os dados dos clientes organizados e acesse rapidamente informações importantes.",
    icon: "👥"
  },
  {
    title: "Rastreamento de atividades",
    description: "Visualize o histórico completo de interações com cada cliente para acompanhamento eficiente.",
    icon: "📝"
  },
  {
    title: "Portal de faturamento",
    description: "Integração com Stripe para gerenciar assinaturas e pagamentos de forma simplificada.",
    icon: "💳"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos poderosos para seu negócio</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para otimizar seu processo de vendas, desde a proposta até o fechamento.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="text-3xl mb-3">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
