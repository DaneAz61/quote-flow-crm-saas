
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const VerificationSent = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold">QuoteFlow</Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Verificação enviada</CardTitle>
            <CardDescription>
              Enviamos um email com um link para verificar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M22 10v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l3-3h14l3 3Z"></path>
                <path d="m2 10 7 5 .5.5.5-.5 7-5"></path>
              </svg>
            </div>
            <p className="mb-4">
              Por favor, verifique sua caixa de entrada e clique no link de verificação para confirmar
              seu endereço de email.
            </p>
            <p className="text-sm text-muted-foreground">
              Se você não receber o email em alguns minutos, verifique sua pasta de spam ou lixo eletrônico.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VerificationSent;
