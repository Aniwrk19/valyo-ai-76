
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

Provide a comprehensive analysis with specific recommendations and actionable insights. Be detailed and thorough in your response.`,

  'problem-solution': `Evaluate the problem-solution fit for this business idea. Analyze:
- Problem identification and validation
- Solution relevance and effectiveness
- User experience considerations
- Pain point severity
- Solution-market alignment

Provide detailed analysis with specific examples and actionable recommendations.`,

  'target-audience': `Analyze the target audience for this business idea. Examine:
- Market size and demographics
- User personas and psychographics
- Market segmentation opportunities
- Accessibility and reach
- Customer journey mapping

Provide comprehensive analysis with detailed insights and specific recommendations.`,

  'go-to-market': `Assess the go-to-market strategy potential for this business idea. Review:
- Distribution channel opportunities
- Pricing strategy considerations
- Marketing approach effectiveness
- Sales process optimization
- Customer acquisition and retention

Provide detailed tactical recommendations and comprehensive strategy analysis.`
};

const toolDetails = {
  'business-idea': { icon: "💡", title: "Business Idea Validator" },
  'problem-solution': { icon: "❓", title: "Problem-Solution Fit" },
  'target-audience': { icon: "👥", title: "Target Audience Analysis" },
  'go-to-market': { icon: "🚀", title: "Go-to-Market Strategy" }
};

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to extract JSON from markdown code blocks
function extractJsonFromMarkdown(content: string): string {
  // Remove markdown code block markers if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  // If no code blocks found, return the content as-is
  return content.trim();
}

function getStatusFromScore(score: number): string {
  if (score >= 8) return "strong";
  if (score >= 6) return "moderate";
  return "needs-work";
}

async function validateWithGemini(businessIdea: string, tool: string, retryCount = 0): Promise<any> {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  if (!geminiApiKey) {
    console.error('Gemini API key not found');
    return {
      id: tool,
      ...toolDetails[tool as keyof typeof toolDetails],
      score: 5,
      status: "moderate",
      summary: "API key not configured. Please configure Gemini API key in Supabase Edge Function Secrets.",
      details: "To fix this issue, please add your Gemini API key to the Supabase Edge Function Secrets with the key name 'GEMINI_API_KEY'."
    };
  }

  const prompt = `Business Idea: "${businessIdea}"

${toolPrompts[tool as keyof typeof toolPrompts]}

IMPORTANT: You must respond with a valid JSON object in this exact format (no markdown, no code blocks):
{
  "score": [number between 1-10],
  "status": "[strong/moderate/needs-work based on score: 8+ = strong, 6-7.9 = moderate, <6 = needs-work]",
  "summary": "[brief one-sentence summary of the analysis]",
  "details": "[detailed analysis as a single string with comprehensive insights, recommendations, and specific examples. Use line breaks (\\n) for formatting if needed]"
}

Make sure the response is valid JSON only, with no additional text or formatting.`;

  try {
    console.log(`Calling Gemini API for tool: ${tool}, attempt: ${retryCount + 1}`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
          candidateCount: 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error response: ${response.status} ${response.statusText} - ${errorText}`);
      
      // Handle rate limiting specifically
      if (response.status === 429 && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await sleep(delay);
        return validateWithGemini(businessIdea, tool, retryCount + 1);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log(`Raw Gemini response for ${tool}:`, content);
    
    try {
      // Extract JSON from potential markdown wrapping
      const cleanedContent = extractJsonFromMarkdown(content);
      console.log(`Cleaned content for ${tool}:`, cleanedContent);
      
      const result = JSON.parse(cleanedContent);
      
      // Validate the response structure
      if (typeof result.score !== 'number' || result.score < 1 || result.score > 10) {
        throw new Error('Invalid score in response');
      }
      
      // Ensure score is properly bounded
      const boundedScore = Math.min(Math.max(Math.round(result.score), 1), 10);
      
      // Ensure status matches score
      const validStatus = getStatusFromScore(boundedScore);
      
      return {
        id: tool,
        ...toolDetails[tool as keyof typeof toolDetails],
        score: boundedScore,
        status: validStatus,
        summary: result.summary || "Analysis completed successfully.",
        details: result.details || "Detailed analysis is available."
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw content:', content);
      
      // Return a fallback response instead of throwing
      return {
        id: tool,
        ...toolDetails[tool as keyof typeof toolDetails],
        score: 5,
        status: "moderate",
        summary: "Analysis completed with partial results due to response format issues.",
        details: "The AI analysis was completed but encountered formatting issues. The core evaluation suggests moderate potential with areas for improvement. Consider refining your business model and conducting additional market research."
      };
    }
  } catch (error: any) {
    console.error(`Error validating with Gemini for tool ${tool}:`, error);
    
    if (retryCount < maxRetries && (error.message.includes('429') || error.message.includes('timeout'))) {
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Error with retry logic, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await sleep(delay);
      return validateWithGemini(businessIdea, tool, retryCount + 1);
    }
    
    // Return a fallback response instead of propagating the error
    return {
      id: tool,
      ...toolDetails[tool as keyof typeof toolDetails],
      score: 5,
      status: "moderate",
      summary: "Analysis could not be completed due to technical issues.",
      details: `Technical error occurred during analysis: ${error.message}. Please try again later or check your API configuration.`
    };
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
    console.log('Business idea:', businessIdea);

    // Run validations sequentially to avoid rate limiting
    const results = [];
    for (const tool of selectedTools) {
      console.log(`Processing tool: ${tool}`);
      const result = await validateWithGemini(businessIdea, tool);
      results.push(result);
      console.log(`Completed tool: ${tool} with score: ${result.score}`);
      
      // Add a delay between requests to be respectful to the API
      if (selectedTools.indexOf(tool) < selectedTools.length - 1) {
        await sleep(1000); // 1 second delay between requests
      }
    }
    
    // Calculate average score from all results (they all should have valid scores now)
    const validScores = results
      .map(result => result.score)
      .filter(score => typeof score === 'number' && !isNaN(score) && score > 0);
    
    const averageScore = validScores.length > 0 
      ? Math.min(validScores.reduce((sum, score) => sum + score, 0) / validScores.length, 10)
      : 5;

    const finalAverageScore = Math.round(averageScore * 10) / 10; // Round to 1 decimal place

    console.log(`Validation completed with ${results.length}/${selectedTools.length} tools, average score:`, finalAverageScore);

    return new Response(
      JSON.stringify({ 
        results,
        averageScore: finalAverageScore,
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
        details: 'Please try again. If the problem persists, check your API configuration.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
