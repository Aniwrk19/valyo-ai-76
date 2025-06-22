
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  businessIdea: string;
  selectedTools: string[];
}

const toolPrompts = {
  'business-idea': `Analyze this business idea for overall viability and potential. Focus on:
- Innovation and uniqueness
- Scalability potential
- Value proposition clarity
- Market timing
- Implementation feasibility
Provide a score from 1-10 and detailed analysis with specific recommendations.`,

  'problem-solution': `Evaluate the problem-solution fit for this business idea. Analyze:
- Problem identification and validation
- Solution relevance and effectiveness
- User experience considerations
- Pain point severity
- Solution-market alignment
Provide a score from 1-10 and detailed analysis with actionable insights.`,

  'target-audience': `Analyze the target audience for this business idea. Examine:
- Market size and demographics
- User personas and psychographics
- Market segmentation opportunities
- Accessibility and reach
- Customer journey mapping
Provide a score from 1-10 and detailed analysis with specific recommendations.`,

  'competitor-analysis': `Conduct a competitive landscape analysis for this business idea. Evaluate:
- Market positioning opportunities
- Competitive advantages and differentiation
- Barriers to entry
- Market gaps and opportunities
- Competitive risks and threats
Provide a score from 1-10 and detailed analysis with strategic insights.`,

  'go-to-market': `Assess the go-to-market strategy potential for this business idea. Review:
- Distribution channel opportunities
- Pricing strategy considerations
- Marketing approach effectiveness
- Sales process optimization
- Customer acquisition and retention
Provide a score from 1-10 and detailed analysis with tactical recommendations.`
};

const toolDetails = {
  'business-idea': { icon: "💡", title: "Business Idea Validator" },
  'problem-solution': { icon: "❓", title: "Problem-Solution Fit" },
  'target-audience': { icon: "👥", title: "Target Audience Analysis" },
  'competitor-analysis': { icon: "⚔️", title: "Competitive Landscape" },
  'go-to-market': { icon: "🚀", title: "Go-to-Market Strategy" }
};

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function validateWithOpenAI(businessIdea: string, tool: string, retryCount = 0): Promise<any> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  const prompt = `Business Idea: "${businessIdea}"

${toolPrompts[tool as keyof typeof toolPrompts]}

Please respond with a JSON object in this exact format:
{
  "score": [number between 1-10],
  "status": "[strong/moderate/needs-work based on score: 8+ = strong, 6-7.9 = moderate, <6 = needs-work]",
  "summary": "[brief one-sentence summary]",
  "details": "[detailed analysis with bullet points, recommendations, and specific insights]"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a startup validation expert. Analyze business ideas thoroughly and provide scores and detailed feedback. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error response: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Handle rate limiting specifically
      if (response.status === 429 && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await sleep(delay);
        return validateWithOpenAI(businessIdea, tool, retryCount + 1);
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const result = JSON.parse(content);
      return {
        id: tool,
        ...toolDetails[tool as keyof typeof toolDetails],
        score: result.score,
        status: result.status,
        summary: result.summary,
        details: result.details
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw content:', content);
      throw new Error('Failed to parse AI response');
    }
  } catch (error: any) {
    if (retryCount < maxRetries && error.message.includes('429')) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Error with retry logic, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await sleep(delay);
      return validateWithOpenAI(businessIdea, tool, retryCount + 1);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessIdea, selectedTools }: ValidationRequest = await req.json();
    
    if (!businessIdea || !selectedTools || selectedTools.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Business idea and selected tools are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating business idea with tools:', selectedTools);

    // Run validations sequentially to avoid rate limiting
    const results = [];
    for (const tool of selectedTools) {
      console.log(`Processing tool: ${tool}`);
      try {
        const result = await validateWithOpenAI(businessIdea, tool);
        results.push(result);
        console.log(`Completed tool: ${tool}`);
        
        // Add a small delay between requests to be respectful to the API
        if (selectedTools.indexOf(tool) < selectedTools.length - 1) {
          await sleep(500); // 500ms delay between requests
        }
      } catch (error: any) {
        console.error(`Error processing tool ${tool}:`, error);
        // Return partial results if some tools succeeded
        if (results.length > 0) {
          console.log('Returning partial results due to error');
          break;
        } else {
          throw error; // Re-throw if no tools succeeded
        }
      }
    }
    
    if (results.length === 0) {
      throw new Error('No validation results could be generated');
    }
    
    // Calculate average score from successful results
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;

    console.log(`Validation completed with ${results.length}/${selectedTools.length} tools, average score:`, averageScore);

    return new Response(
      JSON.stringify({ 
        results,
        averageScore: Number(averageScore.toFixed(1)),
        completedTools: results.length,
        totalTools: selectedTools.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in validate-idea function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'Please try again. If the problem persists, you may have hit API rate limits.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
