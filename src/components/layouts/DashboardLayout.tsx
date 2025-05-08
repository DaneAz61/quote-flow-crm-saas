
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Search, ArrowLeft } from "lucide-react";
import { Input } from "../ui/input";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, subscription } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navigationLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "grid-2x2" },
    { name: "Clientes", href: "/dashboard/customers", icon: "users" },
    { name: "Orçamentos", href: "/dashboard/quotes", icon: "file-text" },
    { name: "CRM", href: "/dashboard/crm", icon: "kanban" },
    { name: "Configurações", href: "/dashboard/settings", icon: "settings" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="flex h-16 items-center px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              {/* Mobile Navigation */}
              <div className="py-4 px-2 h-full flex flex-col">
                <div className="mb-6 px-4 flex items-center">
                  <Link 
                    to="/" 
                    className="font-bold text-xl flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    QuoteFlow
                  </Link>
                </div>
                
                <div className="space-y-1 px-2 flex-1">
                  {navigationLinks.map((link) => (
                    <Button
                      key={link.name}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to={link.href}>
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
                          className="mr-2 h-5 w-5"
                        >
                          {link.icon === "grid-2x2" && (
                            <>
                              <rect width="7" height="7" x="3" y="3" rx="1" />
                              <rect width="7" height="7" x="14" y="3" rx="1" />
                              <rect width="7" height="7" x="14" y="14" rx="1" />
                              <rect width="7" height="7" x="3" y="14" rx="1" />
                            </>
                          )}
                          {link.icon === "users" && (
                            <>
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </>
                          )}
                          {link.icon === "file-text" && (
                            <>
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" x2="8" y1="13" y2="13" />
                              <line x1="16" x2="8" y1="17" y2="17" />
                              <line x1="10" x2="8" y1="9" y2="9" />
                            </>
                          )}
                          {link.icon === "kanban" && (
                            <>
                              <path d="M5 3a2 2 0 0 0-2 2" />
                              <path d="M19 3a2 2 0 0 1 2 2" />
                              <path d="M21 14a2 2 0 0 1-2 2" />
                              <path d="M5 17a2 2 0 0 1-2-2" />
                              <path d="M9 3h1" />
                              <path d="M9 21h1" />
                              <path d="M14 3h1" />
                              <path d="M14 21h1" />
                              <path d="M3 9v1" />
                              <path d="M21 9v1" />
                              <path d="M3 14v1" />
                              <path d="M21 14v1" />
                            </>
                          )}
                          {link.icon === "settings" && (
                            <>
                              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          )}
                        </svg>
                        {link.name}
                      </Link>
                    </Button>
                  ))}
                </div>
                
                <div className="px-4 pt-4 border-t">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {user?.email}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      Sair
                    </Button>
                    <Link to="/" className="mt-4 flex items-center">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      <span className="text-sm">Voltar ao site</span>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Logo - Visible on all screens */}
          <div className="lg:hidden">
            <Link to="/dashboard" className="font-bold text-xl">QuoteFlow</Link>
          </div>

          {/* Desktop Navigation - Fixed to left side */}
          <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-muted border-r flex-col">
            <div className="p-6">
              <Link to="/" className="font-bold text-xl">QuoteFlow</Link>
            </div>
            <div className="px-3 py-2 flex-1">
              <nav className="space-y-1">
                {navigationLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link to={link.href}>
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
                        className="mr-2 h-5 w-5"
                      >
                        {link.icon === "grid-2x2" && (
                          <>
                            <rect width="7" height="7" x="3" y="3" rx="1" />
                            <rect width="7" height="7" x="14" y="3" rx="1" />
                            <rect width="7" height="7" x="14" y="14" rx="1" />
                            <rect width="7" height="7" x="3" y="14" rx="1" />
                          </>
                        )}
                        {link.icon === "users" && (
                          <>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </>
                        )}
                        {link.icon === "file-text" && (
                          <>
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" x2="8" y1="13" y2="13" />
                            <line x1="16" x2="8" y1="17" y2="17" />
                            <line x1="10" x2="8" y1="9" y2="9" />
                          </>
                        )}
                        {link.icon === "kanban" && (
                          <>
                            <path d="M5 3a2 2 0 0 0-2 2" />
                            <path d="M19 3a2 2 0 0 1 2 2" />
                            <path d="M21 14a2 2 0 0 1-2 2" />
                            <path d="M5 17a2 2 0 0 1-2-2" />
                            <path d="M9 3h1" />
                            <path d="M9 21h1" />
                            <path d="M14 3h1" />
                            <path d="M14 21h1" />
                            <path d="M3 9v1" />
                            <path d="M21 9v1" />
                            <path d="M3 14v1" />
                            <path d="M21 14v1" />
                          </>
                        )}
                        {link.icon === "settings" && (
                          <>
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                      {link.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex flex-col">
                <div className="mb-2">
                  <div className="text-sm font-medium">{user?.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {subscription?.subscribed ? `Plano: ${subscription.subscription_tier}` : 'Plano: Gratuito'}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sair
                </Button>
                <Link to="/" className="mt-4 flex items-center text-muted-foreground hover:text-foreground text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span>Voltar ao site</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="ml-auto flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-64 pl-8"
              />
            </div>
            <Button variant="outline" size="icon" className="md:hidden">
              <Search className="h-4 w-4" />
              <span className="sr-only">Buscar</span>
            </Button>
            <div className="hidden md:flex md:items-center">
              <span className="text-sm">
                {subscription?.subscribed ? (
                  <span className="text-green-600 font-medium">Premium ✓</span>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/settings/billing">Atualizar para Premium</Link>
                  </Button>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
