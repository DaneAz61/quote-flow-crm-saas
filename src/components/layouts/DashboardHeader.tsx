
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search } from "lucide-react";

interface DashboardHeaderProps {
  toggleMobileMenu: () => void;
  subscription: any;
}

const DashboardHeader = ({ toggleMobileMenu, subscription }: DashboardHeaderProps) => {
  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="flex h-16 items-center px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <Button variant="outline" size="icon" className="lg:hidden mr-4" onClick={toggleMobileMenu}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        {/* Logo - Visible on mobile */}
        <div className="lg:hidden">
          <Link to="/dashboard" className="font-bold text-xl">QuoteFlow</Link>
        </div>
        
        {/* Search and Premium Status - Right side */}
        <div className="ml-auto flex items-center gap-4">
          <SearchBar />
          <PremiumStatus subscription={subscription} />
        </div>
      </div>
    </header>
  );
};

// Search component
const SearchBar = () => {
  return (
    <>
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
    </>
  );
};

// Premium status component
const PremiumStatus = ({ subscription }: { subscription: any }) => {
  return (
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
  );
};

export default DashboardHeader;
