
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

// Sub-component for navigation icons
const NavigationIcon = ({ icon }: { icon: string }) => {
  return (
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
      {icon === "grid-2x2" && (
        <>
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </>
      )}
      {icon === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {icon === "file-text" && (
        <>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </>
      )}
      {icon === "kanban" && (
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
      {icon === "settings" && (
        <>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
};

export default DashboardSidebar;
