
interface Customer {
  id: string;
  company_name: string;
  industry?: string | null;
  [key: string]: any;
}

interface QuoteItem {
  id: string;
  description: string;
  qty: number;
  unit_price: number;
}

interface QuotePromptData {
  customer: Customer;
  existingItems: QuoteItem[];
  notes?: string;
}

/**
 * Builds a prompt for GPT to generate a quote based on customer data and any existing items
 */
export function buildQuotePrompt(data: QuotePromptData): string {
  const { customer, existingItems, notes } = data;
  
  // Base context information about the customer
  let prompt = `Por favor, gere um orçamento completo para o cliente "${customer.company_name}"`;
  
  // Add industry context if available
  if (customer.industry) {
    prompt += ` que atua no setor de "${customer.industry}"`;
  }
  
  // Add existing items if any
  if (existingItems.length > 0) {
    prompt += `\n\nO orçamento já contém os seguintes itens que devem ser mantidos:\n`;
    
    existingItems.forEach((item, index) => {
      prompt += `${index + 1}. ${item.description} - Quantidade: ${item.qty}, Preço Unitário: R$ ${item.unit_price.toFixed(2)}\n`;
    });
    
    prompt += `\nPor favor, complemente este orçamento com itens adicionais relevantes que façam sentido com os itens existentes.`;
  } else {
    prompt += `\n\nPreciso de um orçamento completo com pelo menos 3 itens relevantes para este cliente.`;
  }
  
  // Add notes context if provided
  if (notes && notes.trim()) {
    prompt += `\n\nConsiderações adicionais: ${notes}`;
  }
  
  // Specific instructions for output format
  prompt += `
  
Por favor, forneça uma resposta estruturada com:
1. Uma lista detalhada de 3 a 5 itens para o orçamento, cada um com:
   - Descrição clara e específica do produto ou serviço
   - Quantidade recomendada
   - Preço unitário sugerido (em Reais)

2. Um texto curto para ser usado nas observações do orçamento, incluindo condições como:
   - Validade do orçamento
   - Condições de pagamento
   - Prazos de entrega ou execução

Formate os itens como objetos JSON para facilitar a integração.
`;

  // TODO: Add more customizations to the prompt based on industry, previous interactions, etc.
  
  return prompt;
}

/**
 * Process the response from GPT and extract structured quote data
 * This is a placeholder - actual implementation would depend on the AI response format
 */
export function processGptResponse(response: string): {
  items: Omit<QuoteItem, 'id'>[];
  notes: string;
} {
  // TODO: Implement parsing logic for the GPT response
  // This would extract items and notes from the AI-generated text
  
  // Return placeholder data
  return {
    items: [
      { description: "Item gerado pelo GPT", qty: 1, unit_price: 100 }
    ],
    notes: "Notas geradas pelo GPT"
  };
}
