
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import CrmKanban from "@/components/dashboard/CrmKanban";

const SalesKanban = () => {
  return (
    <Card className="p-0">
      <CardHeader>
        <CardTitle>Pipeline de Vendas</CardTitle>
        <CardDescription>
          Acompanhe seus leads em cada estágio do funil de vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CrmKanban />
      </CardContent>
    </Card>
  );
};

export default SalesKanban;
