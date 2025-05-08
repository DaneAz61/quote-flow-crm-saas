
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Orçamentos profissionais em <span className="text-primary">minutos</span>, não horas
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Transforme seu processo de vendas com orçamentos gerados por IA, 
          acompanhamento automatizado e fechamento mais rápido de negócios.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" onClick={onGetStarted}>
            Começar agora
          </Button>
          <Button size="lg" variant="outline">
            Agendar demonstração
          </Button>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-20 bottom-0 top-auto"></div>
          <img 
            src="/placeholder.svg" 
            alt="QuoteFlow Dashboard" 
            className="rounded-t-xl shadow-2xl border border-border mx-auto max-w-full" 
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
