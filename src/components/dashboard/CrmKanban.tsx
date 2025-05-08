
import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Stage {
  id: string;
  name: string;
  position: number;
}

interface Customer {
  id: string;
  company_name: string;
}

interface Lead {
  id: string;
  quote_id: string;
  stage_id: string;
  next_action_date: string | null;
  notes: string | null;
  quote: {
    id: string;
    amount_total: number;
    customer_id: string;
    customer: Customer;
  };
}

type LeadsByStage = {
  [key: string]: Lead[];
};

const CrmKanban = () => {
  // Placeholder stages for rendering
  const initialStages: Stage[] = [
    { id: '1', name: 'Novo', position: 1 },
    { id: '2', name: 'Enviado', position: 2 },
    { id: '3', name: 'Negociação', position: 3 },
    { id: '4', name: 'Fechado-Ganho', position: 4 },
    { id: '5', name: 'Fechado-Perdido', position: 5 }
  ];
  
  const [stages] = useState<Stage[]>(initialStages);
  const [leadsByStage] = useState<LeadsByStage>({});
  const [loading] = useState(false);
  const { toast } = useToast();
  
  const handleDragEnd = () => {
    toast({
      title: "Feature unavailable",
      description: "The CRM functionality requires database tables that haven't been set up yet.",
      variant: "destructive"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando quadro CRM...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-[800px] pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-72 flex-shrink-0">
              <div className="bg-muted rounded-md p-3 mb-3">
                <h3 className="font-medium text-sm mb-1">{stage.name}</h3>
                <div className="text-xs text-muted-foreground">
                  {leadsByStage[stage.id]?.length || 0} leads
                </div>
              </div>

              <div className="min-h-[200px] rounded-md flex items-center justify-center p-4 text-center text-muted-foreground text-sm border-2 border-dashed">
                <div>
                  <p className="mb-2">CRM functionality requires database setup</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      toast({
                        title: "Tables required",
                        description: "The crm_stages, crm_leads, and related tables need to be created in your database.",
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default CrmKanban;
