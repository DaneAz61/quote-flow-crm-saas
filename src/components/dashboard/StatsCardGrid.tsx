
import React from "react";
import StatsCard from "./StatsCard";
import { Users, FileText, Activity, Globe } from "lucide-react";

interface StatsCardGridProps {
  customerCount: number;
  quoteCount: number;
  leadCount: number;
  totalAmount: number;
  loading: boolean;
  formatCurrency: (amount: number) => string;
}

const StatsCardGrid = ({
  customerCount,
  quoteCount,
  leadCount,
  totalAmount,
  loading,
  formatCurrency
}: StatsCardGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Customer Card */}
      <StatsCard
        title="Total de Clientes"
        value={customerCount}
        description={customerCount === 1 ? "cliente cadastrado" : "clientes cadastrados"}
        loading={loading}
        icon={<Users className="h-4 w-4" />}
      />
      
      {/* Quote Card */}
      <StatsCard
        title="Orçamentos"
        value={quoteCount}
        description={quoteCount === 1 ? "orçamento criado" : "orçamentos criados"}
        loading={loading}
        icon={<FileText className="h-4 w-4" />}
      />
      
      {/* Leads Card */}
      <StatsCard
        title="Leads em Acompanhamento"
        value={leadCount}
        description={leadCount === 1 ? "lead ativo" : "leads ativos"}
        loading={loading}
        icon={<Activity className="h-4 w-4" />}
      />
      
      {/* Total Amount Card */}
      <StatsCard
        title="Volume Total"
        value={formatCurrency(totalAmount)}
        description="valor dos orçamentos criados"
        loading={loading}
        icon={<Globe className="h-4 w-4" />}
      />
    </div>
  );
};

export default StatsCardGrid;
