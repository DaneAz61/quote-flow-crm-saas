
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-xl">QuoteFlow</Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </Link>
          <Link to="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Planos
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Button asChild variant="default">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild variant="default">
                <Link to="/signup">Criar conta</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
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
          >
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6L18 18" />
            ) : (
              <path d="M4 12h16M4 6h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link to="/#features" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </Link>
            <Link to="/#pricing" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
            <Link to="/about" className="block py-2 text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </Link>
            <div className="pt-2 border-t border-border">
              {user ? (
                <Button asChild className="w-full" variant="default">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild className="w-full" variant="default">
                    <Link to="/signup">Criar conta</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
