import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const documateApiKey = Deno.env.get('DOCUMATE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    // Get the authorization header to identify the user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to get user info
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { validationResults, averageScore, businessIdea }: PDFRequest = await req.json();
    
    if (!validationResults || !businessIdea) {
      return new Response(
        JSON.stringify({ error: 'Validation results and business idea are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating PDF report for user:', user.id, 'with idea:', businessIdea);
    console.log('Using Documate API key:', documateApiKey ? 'Present' : 'Missing');

    if (!documateApiKey) {
      return new Response(
        JSON.stringify({ error: 'Documate API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the HTML content for the PDF
    const htmlContent = generateReportHTML(validationResults, averageScore, businessIdea);

    // Call Documate API to generate PDF with correct format
    const documateResponse = await fetch('https://api.documate.org/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `${documateApiKey}`, // Remove "Bearer " prefix
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        format: 'pdf',
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

    console.log('Documate response status:', documateResponse.status);
    console.log('Documate response headers:', Object.fromEntries(documateResponse.headers.entries()));

    if (!documateResponse.ok) {
      const errorText = await documateResponse.text();
      console.error(`Documate API error: ${documateResponse.status} ${documateResponse.statusText} - ${errorText}`);
      
      // Try alternative format if PDF fails
      console.log('PDF generation failed, trying HTML format...');
      
      const htmlResponse = await fetch('https://api.documate.org/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `${documateApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          format: 'html'
        }),
      });

      if (!htmlResponse.ok) {
        const htmlErrorText = await htmlResponse.text();
        console.error(`HTML generation also failed: ${htmlResponse.status} - ${htmlErrorText}`);
        throw new Error(`Failed to generate document: ${documateResponse.status} ${documateResponse.statusText}`);
      }

      // Return HTML file
      const htmlBlob = await htmlResponse.blob();
      const htmlArrayBuffer = await htmlBlob.arrayBuffer();
      
      console.log('HTML document generated successfully, size:', htmlArrayBuffer.byteLength);

      // Save export record to database
      const exportRecord = {
        user_id: user.id,
        business_idea: businessIdea,
        validation_results: validationResults,
        average_score: averageScore,
        export_type: 'html',
        file_size: htmlArrayBuffer.byteLength
      };

      const { error: saveError } = await supabase
        .from('exported_reports')
        .insert(exportRecord);

      if (saveError) {
        console.error('Error saving export record:', saveError);
      }

      return new Response(htmlArrayBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="validation-report-${Date.now()}.html"`,
        },
      });
    }

    // Get the PDF blob from Documate
    const pdfBlob = await documateResponse.blob();
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    
    console.log('PDF generated successfully, size:', pdfArrayBuffer.byteLength);

    // Save export record to database
    const exportRecord = {
      user_id: user.id,
      business_idea: businessIdea,
      validation_results: validationResults,
      average_score: averageScore,
      export_type: 'pdf',
      file_size: pdfArrayBuffer.byteLength
    };

    const { error: saveError } = await supabase
      .from('exported_reports')
      .insert(exportRecord);

    if (saveError) {
      console.error('Error saving export record:', saveError);
    } else {
      console.log('Export record saved for user:', user.id);
    }

    // Return the PDF as a response
    return new Response(pdfArrayBuffer, {
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
        details: 'Please try again. If the problem persists, check your Documate API key configuration.'
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
