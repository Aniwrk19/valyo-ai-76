
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const documateApiKey = Deno.env.get('DOCUMATE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFRequest {
  validationResults: any[];
  averageScore: number;
  businessIdea: string;
}

interface ValidationResult {
  id: string;
  icon: string;
  title: string;
  score: number;
  status: string;
  summary: string;
  details: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { validationResults, averageScore, businessIdea }: PDFRequest = await req.json();
    
    if (!validationResults || !businessIdea) {
      return new Response(
        JSON.stringify({ error: 'Validation results and business idea are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PDF report for:', businessIdea);

    // Create the HTML content for the PDF
    const htmlContent = generateReportHTML(validationResults, averageScore, businessIdea);

    // Call Documate API to generate PDF
    const response = await fetch('https://api.documate.org/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${documateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '1in',
            right: '1in',
            bottom: '1in',
            left: '1in'
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Documate API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
    }

    // Get the PDF blob from Documate
    const pdfBlob = await response.blob();
    
    console.log('PDF generated successfully');

    // Return the PDF as a response
    return new Response(pdfBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="validation-report-${Date.now()}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Error in generate-pdf-report function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'Please try again. If the problem persists, check your Documate API key.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateReportHTML(validationResults: ValidationResult[], averageScore: number, businessIdea: string): string {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981'; // green
    if (score >= 6) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      strong: '#10b981',
      moderate: '#f59e0b',
      'needs-work': '#ef4444'
    };
    return `<span style="background-color: ${colors[status as keyof typeof colors] || '#6b7280'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${status.toUpperCase()}</span>`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Business Idea Validation Report</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #6b7280;
        }
        .business-idea {
          background-color: #f8fafc;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 30px 0;
          border-radius: 0 8px 8px 0;
        }
        .business-idea h3 {
          color: #1e40af;
          margin-top: 0;
        }
        .overall-score {
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
        }
        .score-circle {
          display: inline-block;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.2);
          line-height: 80px;
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        .validation-result {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin: 20px 0;
          overflow: hidden;
        }
        .result-header {
          background-color: #f9fafb;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .result-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .result-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 14px;
        }
        .score-badge {
          font-weight: bold;
          font-size: 16px;
        }
        .result-content {
          padding: 20px;
        }
        .summary {
          font-style: italic;
          color: #6b7280;
          margin-bottom: 15px;
        }
        .details {
          color: #374151;
          white-space: pre-wrap;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Business Idea Validation Report</div>
        <div class="subtitle">Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>

      <div class="business-idea">
        <h3>💡 Business Idea</h3>
        <p>${businessIdea}</p>
      </div>

      <div class="overall-score">
        <h2 style="margin-top: 0;">Overall Validation Score</h2>
        <div class="score-circle">${averageScore}/10</div>
        <p style="margin-bottom: 0;">Based on ${validationResults.length} validation tool${validationResults.length > 1 ? 's' : ''}</p>
      </div>

      ${validationResults.map((result, index) => `
        ${index > 0 ? '<div class="page-break"></div>' : ''}
        <div class="validation-result">
          <div class="result-header">
            <div class="result-title">${result.icon} ${result.title}</div>
            <div class="result-meta">
              <span class="score-badge" style="color: ${getScoreColor(result.score)};">
                Score: ${result.score}/10
              </span>
              ${getStatusBadge(result.status)}
            </div>
          </div>
          <div class="result-content">
            <div class="summary">${result.summary}</div>
            <div class="details">${result.details}</div>
          </div>
        </div>
      `).join('')}

      <div class="footer">
        <p>This report was generated using AI-powered validation tools.<br>
        Results should be used as guidance and supplemented with additional market research.</p>
      </div>
    </body>
    </html>
  `;
}
