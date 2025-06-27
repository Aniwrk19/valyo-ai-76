
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
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
  'go-to-market': { icon: "🚀", title: "Go-to-Market Strategy" }
};

// Enhanced sleep function with jitter to avoid thundering herd
const sleep = (ms: number) => {
  const jitter = Math.random() * 1000; // Add up to 1 second of random jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
};

// Function to extract JSON from markdown code blocks
function extractJsonFromMarkdown(content: string): string {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return content.trim();
}

async function validateWithGemini(businessIdea: string, tool: string, retryCount = 0): Promise<any> {
  const maxRetries = 5; // Increased retry count
  const baseDelay = 2000; // Increased base delay to 2 seconds

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
    console.log(`Attempting validation for ${tool} (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a startup validation expert. Analyze business ideas thoroughly and provide scores and detailed feedback. Always respond with valid JSON only, no markdown formatting.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error response: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Handle rate limiting and service unavailable with exponential backoff
      if ((response.status === 429 || response.status === 503) && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`API overloaded/rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
        await sleep(delay);
        return validateWithGemini(businessIdea, tool, retryCount + 1);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    
    console.log(`Raw Gemini response for ${tool}:`, content);
    
    try {
      const cleanedContent = extractJsonFromMarkdown(content);
      console.log(`Cleaned content for ${tool}:`, cleanedContent);
      
      const result = JSON.parse(cleanedContent);
      
      // Validate the result structure
      if (!result.score || !result.status || !result.summary) {
        throw new Error('Incomplete response from AI');
      }
      
      return {
        id: tool,
        ...toolDetails[tool as keyof typeof toolDetails],
        score: result.score,
        status: result.status,
        summary: result.summary,
        details: result.details
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw content:', content);
      
      if (retryCount < maxRetries) {
        console.log(`Parse error, retrying ${tool} (attempt ${retryCount + 1}/${maxRetries + 1})`);
        await sleep(baseDelay);
        return validateWithGemini(businessIdea, tool, retryCount + 1);
      }
      
      throw new Error('Failed to parse AI response after multiple attempts');
    }
  } catch (error: any) {
    console.error(`Error in validateWithGemini for ${tool}:`, error);
    
    // Retry on network errors or API issues
    if (retryCount < maxRetries && (
      error.message.includes('429') || 
      error.message.includes('503') || 
      error.message.includes('fetch') ||
      error.message.includes('network')
    )) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Network/API error, retrying ${tool} in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await sleep(delay);
      return validateWithGemini(businessIdea, tool, retryCount + 1);
    }
    
    throw error;
  }
}

serve(async (req) => {
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
    console.log('Business idea:', businessIdea);

    const results = [];
    const errors = [];
    
    // Process tools sequentially with better error handling
    for (let i = 0; i < selectedTools.length; i++) {
      const tool = selectedTools[i];
      console.log(`Processing tool: ${tool} (${i + 1}/${selectedTools.length})`);
      
      try {
        const result = await validateWithGemini(businessIdea, tool);
        results.push(result);
        console.log(`Successfully completed tool: ${tool} with score: ${result.score}`);
        
        // Add delay between successful requests to be respectful to API
        if (i < selectedTools.length - 1) {
          await sleep(1000); // 1 second delay between requests
        }
      } catch (error: any) {
        console.error(`Failed to process tool ${tool} after all retries:`, error.message);
        errors.push({
          tool,
          error: error.message
        });
        
        // Continue with other tools even if one fails
        continue;
      }
    }
    
    // Return results even if some tools failed, but include error information
    if (results.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'All validation tools failed',
          details: 'The AI service appears to be overloaded. Please try again in a few minutes.',
          failedTools: errors
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length;

    console.log(`Validation completed with ${results.length}/${selectedTools.length} tools, average score:`, averageScore);
    
    const response = {
      results,
      averageScore: Number(averageScore.toFixed(1)),
      completedTools: results.length,
      totalTools: selectedTools.length
    };
    
    // Include partial results warning if not all tools completed
    if (results.length < selectedTools.length) {
      response.warning = `Only ${results.length} out of ${selectedTools.length} validation tools completed successfully. The AI service may be experiencing high load.`;
      response.failedTools = errors;
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in validate-idea function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: 'The validation service is currently experiencing issues. Please try again in a few minutes.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
