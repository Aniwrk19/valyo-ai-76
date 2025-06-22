
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

async function validateWithOpenAI(businessIdea: string, tool: string): Promise<any> {
  const prompt = `Business Idea: "${businessIdea}"

${toolPrompts[tool as keyof typeof toolPrompts]}

Please respond with a JSON object in this exact format:
{
  "score": [number between 1-10],
  "status": "[strong/moderate/needs-work based on score: 8+ = strong, 6-7.9 = moderate, <6 = needs-work]",
  "summary": "[brief one-sentence summary]",
  "details": "[detailed analysis with bullet points, recommendations, and specific insights]"
}`;

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
    throw new Error(`OpenAI API error: ${response.statusText}`);
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
    throw new Error('Failed to parse AI response');
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

    // Run all validations in parallel
    const validationPromises = selectedTools.map(tool => 
      validateWithOpenAI(businessIdea, tool)
    );

    const results = await Promise.all(validationPromises);
    
    // Calculate average score
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;

    console.log('Validation completed, average score:', averageScore);

    return new Response(
      JSON.stringify({ 
        results,
        averageScore: Number(averageScore.toFixed(1))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in validate-idea function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
