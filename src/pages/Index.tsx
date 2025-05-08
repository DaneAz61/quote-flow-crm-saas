
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import HeroSection from "@/components/marketing/HeroSection";
import PricingSection from "@/components/marketing/PricingSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import MainLayout from "@/components/layouts/MainLayout";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <MainLayout>
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection />
      <PricingSection onGetStarted={handleGetStarted} />
      <section className="container mx-auto py-20">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para transformar sua forma de criar orçamentos?</CardTitle>
            <CardDescription>Experimente gratuitamente por 14 dias. Sem compromisso.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Junte-se a centenas de empresas que economizam tempo e fecham mais negócios usando nossa plataforma.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="lg" onClick={handleGetStarted}>Começar agora</Button>
          </CardFooter>
        </Card>
      </section>
    </MainLayout>
  );
};

export default Index;
