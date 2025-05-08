
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsCardGrid from "@/components/dashboard/StatsCardGrid";
import DashboardError from "@/components/dashboard/DashboardError";
import SalesKanban from "@/components/dashboard/SalesKanban";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/lib/auth/AuthContext";

const Dashboard = () => {
  const { user, subscription } = useAuth();
  const { customerCount, quoteCount, leadCount, totalAmount, loading, error } = useDashboardData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <WelcomeSection user={user} subscription={subscription} />

        {error && <DashboardError message={error} />}

        {!error && (
          <>
            {/* Stats Cards */}
            <StatsCardGrid
              customerCount={customerCount}
              quoteCount={quoteCount}
              leadCount={leadCount}
              totalAmount={totalAmount}
              loading={loading}
              formatCurrency={formatCurrency}
            />

            {/* CRM Kanban Board */}
            <SalesKanban />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
