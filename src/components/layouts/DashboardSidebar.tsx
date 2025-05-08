
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Users, FileText, Kanban, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface DashboardSidebarProps {
  user: any;
  subscription: any;
  handleSignOut: () => void;
}

const DashboardSidebar = ({ user, subscription, handleSignOut }: DashboardSidebarProps) => {
  const navigationLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "grid-2x2" },
    { name: "Clientes", href: "/dashboard/customers", icon: "users" },
    { name: "Orçamentos", href: "/dashboard/quotes", icon: "file-text" },
    { name: "CRM", href: "/dashboard/crm", icon: "kanban" },
    { name: "Configurações", href: "/dashboard/settings", icon: "settings" }
  ];

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-muted border-r flex-col">
      <div className="p-6">
        <Link to="/" className="font-bold text-xl">QuoteFlow</Link>
      </div>
      <div className="px-3 py-2 flex-1">
        <nav className="space-y-1">
          {navigationLinks.map((link) => (
            <NavigationLink key={link.name} link={link} />
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
  );
};

// Sub-component for navigation links
const NavigationLink = ({ link }: { link: { name: string; href: string; icon: string } }) => {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      asChild
    >
      <Link to={link.href}>
        <NavigationIcon icon={link.icon} />
        {link.name}
      </Link>
    </Button>
  );
};

// Sub-component for navigation icons using Lucide React icons
const NavigationIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "grid-2x2":
      return <LayoutGrid className="mr-2 h-5 w-5" />;
    case "users":
      return <Users className="mr-2 h-5 w-5" />;
    case "file-text":
      return <FileText className="mr-2 h-5 w-5" />;
    case "kanban":
      return <Kanban className="mr-2 h-5 w-5" />;
    case "settings":
      return <Settings className="mr-2 h-5 w-5" />;
    default:
      return null;
  }
};

export default DashboardSidebar;
