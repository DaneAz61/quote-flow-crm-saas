
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Users, FileText, Kanban, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface DashboardMobileSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: any;
  handleSignOut: () => void;
}

const DashboardMobileSidebar = ({ 
  open, 
  setOpen, 
  user, 
  handleSignOut 
}: DashboardMobileSidebarProps) => {
  const navigationLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "grid-2x2" },
    { name: "Clientes", href: "/dashboard/customers", icon: "users" },
    { name: "Orçamentos", href: "/dashboard/quotes", icon: "file-text" },
    { name: "CRM", href: "/dashboard/crm", icon: "kanban" },
    { name: "Configurações", href: "/dashboard/settings", icon: "settings" }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="py-4 px-2 h-full flex flex-col">
          <div className="mb-6 px-4 flex items-center">
            <Link 
              to="/" 
              className="font-bold text-xl flex items-center"
              onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
              >
                <Link to={link.href}>
                  <MobileNavigationIcon icon={link.icon} />
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
  );
};

// Sub-component for navigation icons using Lucide React icons
const MobileNavigationIcon = ({ icon }: { icon: string }) => {
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

export default DashboardMobileSidebar;
