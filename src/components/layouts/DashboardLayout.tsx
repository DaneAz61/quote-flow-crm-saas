
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import DashboardMobileSidebar from "./DashboardMobileSidebar";

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Sidebar */}
      <DashboardMobileSidebar 
        open={isMobileMenuOpen}
        setOpen={setIsMobileMenuOpen}
        user={user}
        handleSignOut={handleSignOut}
      />
      
      {/* Header */}
      <DashboardHeader 
        toggleMobileMenu={toggleMobileMenu}
        subscription={subscription}
      />

      {/* Desktop Sidebar */}
      <DashboardSidebar 
        user={user}
        subscription={subscription}
        handleSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
