
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

interface QuoteData {
  id: string;
  customer: {
    company_name: string;
    address: string | null;
    phone: string | null;
  };
  amount_total: number;
  currency: string;
  items: {
    description: string;
    qty: number;
    unit_price: number;
  }[];
  owner: {
    email: string;
  };
  notes: string | null;
  created_at: string;
}

// Create a Supabase client with the service role key
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId } = await req.json();
    
    if (!quoteId) {
      throw new Error("Quote ID is required");
    }
    
    // Fetch quote data with joins to related tables
    const { data: quoteData, error: quoteError } = await supabaseClient
      .from("quotes")
      .select(`
        *,
        customer:customers(*),
        items:quote_items(*),
        owner:users(*)
      `)
      .eq("id", quoteId)
      .single();
    
    if (quoteError) throw quoteError;
    if (!quoteData) throw new Error("Quote not found");
    
    // Get notes if available
    const { data: leadData } = await supabaseClient
      .from("crm_leads")
      .select("notes")
      .eq("quote_id", quoteId)
      .single();
    
    const notes = leadData?.notes || null;
    
    // Create PDF
    const pdf = await generatePdf({
      ...quoteData,
      notes
    } as QuoteData);
    
    // Upload to Supabase Storage
    const filename = `quotes/${quoteId}.pdf`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('pdfs')
      .upload(filename, pdf, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: urlData } = await supabaseClient
      .storage
      .from('pdfs')
      .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 days expiry
    
    const pdfUrl = urlData?.signedUrl;
    
    // Update quote with PDF URL
    await supabaseClient
      .from("quotes")
      .update({ pdf_url: pdfUrl })
      .eq("id", quoteId);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        pdfUrl 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});

async function generatePdf(quoteData: QuoteData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Get fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Page dimensions
  const { width, height } = page.getSize();
  const margin = 50;
  
  // Draw header
  page.drawText("ORÇAMENTO", {
    x: margin,
    y: height - margin,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1)
  });
  
  page.drawText(`#${quoteData.id.substring(0, 8)}`, {
    x: margin,
    y: height - margin - 30,
    size: 12,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  // Draw date
  const formattedDate = new Date(quoteData.created_at).toLocaleDateString('pt-BR');
  page.drawText(`Data: ${formattedDate}`, {
    x: width - margin - 150,
    y: height - margin,
    size: 12,
    font: helveticaFont
  });
  
  // Draw customer info section
  page.drawText("PARA:", {
    x: margin,
    y: height - margin - 80,
    size: 12,
    font: helveticaBold
  });
  
  page.drawText(quoteData.customer.company_name, {
    x: margin,
    y: height - margin - 100,
    size: 14,
    font: helveticaBold
  });
  
  if (quoteData.customer.address) {
    page.drawText(quoteData.customer.address, {
      x: margin,
      y: height - margin - 120,
      size: 12,
      font: helveticaFont
    });
  }
  
  if (quoteData.customer.phone) {
    page.drawText(`Tel: ${quoteData.customer.phone}`, {
      x: margin,
      y: height - margin - 140,
      size: 12,
      font: helveticaFont
    });
  }
  
  // Draw from section (company info)
  page.drawText("DE:", {
    x: width - margin - 150,
    y: height - margin - 80,
    size: 12,
    font: helveticaBold
  });
  
  page.drawText("QuoteFlow", {
    x: width - margin - 150,
    y: height - margin - 100,
    size: 14,
    font: helveticaBold
  });
  
  page.drawText(quoteData.owner.email, {
    x: width - margin - 150,
    y: height - margin - 120,
    size: 12,
    font: helveticaFont
  });
  
  // Draw items table header
  const tableTop = height - margin - 200;
  const colWidths = [40, 280, 80, 80];
  const colStarts = [margin];
  for (let i = 1; i < colWidths.length; i++) {
    colStarts.push(colStarts[i - 1] + colWidths[i - 1]);
  }
  
  // Draw table header
  page.drawRectangle({
    x: margin,
    y: tableTop - 30,
    width: width - margin * 2,
    height: 30,
    color: rgb(0.95, 0.95, 0.95)
  });
  
  const headerTitles = ["QTD", "DESCRIÇÃO", "PREÇO UNIT.", "SUBTOTAL"];
  headerTitles.forEach((title, i) => {
    page.drawText(title, {
      x: colStarts[i] + 5,
      y: tableTop - 15,
      size: 10,
      font: helveticaBold
    });
  });
  
  // Draw table rows
  let currentY = tableTop - 30;
  const rowHeight = 30;
  
  quoteData.items.forEach((item, index) => {
    currentY -= rowHeight;
    
    // Draw row background with alternating colors
    if (index % 2 === 0) {
      page.drawRectangle({
        x: margin,
        y: currentY - rowHeight,
        width: width - margin * 2,
        height: rowHeight,
        color: rgb(0.98, 0.98, 0.98)
      });
    }
    
    // Draw item data
    page.drawText(item.qty.toString(), {
      x: colStarts[0] + 5,
      y: currentY - 15,
      size: 10,
      font: helveticaFont
    });
    
    page.drawText(item.description, {
      x: colStarts[1] + 5,
      y: currentY - 15,
      size: 10,
      font: helveticaFont,
      maxWidth: colWidths[1] - 10
    });
    
    const formatCurrency = (amount: number) =>
      amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: quoteData.currency
      });
    
    page.drawText(formatCurrency(item.unit_price), {
      x: colStarts[2] + 5,
      y: currentY - 15,
      size: 10,
      font: helveticaFont
    });
    
    const subtotal = item.qty * item.unit_price;
    page.drawText(formatCurrency(subtotal), {
      x: colStarts[3] + 5,
      y: currentY - 15,
      size: 10,
      font: helveticaFont
    });
  });
  
  // Draw total
  currentY -= rowHeight + 20;
  page.drawLine({
    start: { x: colStarts[2], y: currentY + 10 },
    end: { x: width - margin, y: currentY + 10 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7)
  });
  
  page.drawText("TOTAL:", {
    x: colStarts[2] + 5,
    y: currentY - 10,
    size: 12,
    font: helveticaBold
  });
  
  const formattedTotal = quoteData.amount_total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: quoteData.currency
  });
  
  page.drawText(formattedTotal, {
    x: colStarts[3] + 5,
    y: currentY - 10,
    size: 12,
    font: helveticaBold
  });
  
  // Draw notes if available
  if (quoteData.notes) {
    currentY -= 60;
    page.drawText("OBSERVAÇÕES:", {
      x: margin,
      y: currentY,
      size: 12,
      font: helveticaBold
    });
    
    page.drawText(quoteData.notes, {
      x: margin,
      y: currentY - 20,
      size: 10,
      font: helveticaFont,
      maxWidth: width - margin * 2,
      lineHeight: 15
    });
  }
  
  // Draw footer
  page.drawText("Gerado por QuoteFlow - www.quoteflow.com", {
    x: width / 2 - 100,
    y: margin,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5)
  });
  
  // Serialize the PDFDocument to bytes
  return await pdfDoc.save();
}
