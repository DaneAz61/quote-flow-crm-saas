
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
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
  const [stages, setStages] = useState<Stage[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<LeadsByStage>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStagesAndLeads = async () => {
      try {
        // Fetch stages
        const { data: stagesData, error: stagesError } = await supabase
          .from('crm_stages')
          .select('*')
          .order('position');
        
        if (stagesError) {
          throw stagesError;
        }
        
        if (!stagesData) {
          throw new Error('No stages data returned');
        }
        
        setStages(stagesData);
        
        // Fetch leads with related data
        const { data: leadsData, error: leadsError } = await supabase
          .from('crm_leads')
          .select(`
            *,
            quote:quotes(
              id,
              amount_total,
              customer_id,
              customer:customers(
                id, 
                company_name
              )
            )
          `);
        
        if (leadsError) {
          throw leadsError;
        }
        
        if (!leadsData) {
          throw new Error('No leads data returned');
        }
        
        // Group leads by stage
        const groupedLeads = leadsData.reduce((acc: LeadsByStage, lead) => {
          if (!acc[lead.stage_id]) {
            acc[lead.stage_id] = [];
          }
          acc[lead.stage_id].push(lead);
          return acc;
        }, {});
        
        setLeadsByStage(groupedLeads);
      } catch (error) {
        console.error('Error fetching Kanban data:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar o quadro CRM.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStagesAndLeads();
  }, [toast]);
  
  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same column at the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // If moving to a new stage, update the lead in the database
    if (source.droppableId !== destination.droppableId) {
      try {
        // Update lead in database
        const { error } = await supabase
          .from('crm_leads')
          .update({ stage_id: destination.droppableId })
          .eq('id', draggableId);
          
        if (error) throw error;
        
        // Update local state
        const newLeadsByStage = { ...leadsByStage };
        
        // Remove from source
        const leadToMove = newLeadsByStage[source.droppableId].find(
          lead => lead.id === draggableId
        );
        
        if (!leadToMove) return;
        
        newLeadsByStage[source.droppableId] = newLeadsByStage[source.droppableId].filter(
          lead => lead.id !== draggableId
        );
        
        // Add to destination
        if (!newLeadsByStage[destination.droppableId]) {
          newLeadsByStage[destination.droppableId] = [];
        }
        
        const leadWithNewStage = {
          ...leadToMove,
          stage_id: destination.droppableId
        };
        
        newLeadsByStage[destination.droppableId].splice(
          destination.index,
          0,
          leadWithNewStage
        );
        
        setLeadsByStage(newLeadsByStage);
        
        // Log activity
        await supabase.from('activity_log').insert({
          entity_type: 'crm_lead',
          entity_id: draggableId,
          action: 'move_stage',
          actor_id: (await supabase.auth.getUser()).data.user?.id,
          data: {
            from_stage_id: source.droppableId,
            to_stage_id: destination.droppableId
          }
        });
        
        toast({
          title: 'Lead movido',
          description: 'Lead movido para novo estágio com sucesso.'
        });
      } catch (error) {
        console.error('Error moving lead:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao mover lead',
          description: 'Não foi possível atualizar o lead.'
        });
      }
    } else {
      // Same column, different position - just reorder in UI
      const newLeadsByStage = { ...leadsByStage };
      const column = [...newLeadsByStage[source.droppableId]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      newLeadsByStage[source.droppableId] = column;
      setLeadsByStage(newLeadsByStage);
    }
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

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-md transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/80' : ''
                    }`}
                  >
                    {leadsByStage[stage.id]?.map((lead, index) => (
                      <Draggable 
                        key={lead.id} 
                        draggableId={lead.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              // Add custom styles
                            }}
                            className="mb-3"
                          >
                            <Card className={`shadow-sm ${snapshot.isDragging ? 'opacity-80' : ''}`}>
                              <CardContent className="p-3">
                                <div className="font-medium text-sm mb-1">
                                  {lead.quote.customer.company_name}
                                </div>
                                <div className="text-muted-foreground text-xs mb-2">
                                  Orçamento #{lead.quote_id.substring(0, 6)}...
                                </div>
                                <div className="text-sm font-medium">
                                  {formatCurrency(lead.quote.amount_total)}
                                </div>
                                {lead.next_action_date && (
                                  <div className="text-xs text-muted-foreground mt-2 flex items-center">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="mr-1"
                                    >
                                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                      <line x1="16" x2="16" y1="2" y2="6" />
                                      <line x1="8" x2="8" y1="2" y2="6" />
                                      <line x1="3" x2="21" y1="10" y2="10" />
                                    </svg>
                                    {new Date(lead.next_action_date).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                                <div className="flex justify-end mt-2">
                                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                                    Ver detalhes
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default CrmKanban;
