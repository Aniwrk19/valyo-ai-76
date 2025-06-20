
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RotateCcw, Download, Share2, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const validationResults = [
    {
      id: "business-idea",
      icon: "💡",
      title: "Business Idea Validator",
      score: 8.5,
      status: "strong",
      summary: "Your idea shows strong potential with clear value proposition",
      details: `Your business idea demonstrates several key strengths:

• **Clear Problem Identification**: The problem you're addressing is well-defined and affects a significant market segment
• **Innovative Solution**: Your approach offers a unique angle that differentiates from existing solutions  
• **Scalability Potential**: The business model shows strong potential for growth and expansion
• **Market Timing**: Current market conditions appear favorable for this type of solution

**Recommendations for Improvement:**
- Consider expanding your value proposition to address secondary pain points
- Develop a clearer monetization strategy with multiple revenue streams
- Focus on building a strong brand identity early in development`
    },
    {
      id: "problem-solution",
      icon: "❓",
      title: "Problem-Solution Fit",
      score: 7.2,
      status: "moderate",
      summary: "Good alignment between problem and solution with room for refinement",
      details: `Analysis of your problem-solution alignment:

• **Problem Validation**: The problem you're solving is real and affects your target market
• **Solution Relevance**: Your proposed solution directly addresses the core pain points
• **User Experience**: The solution pathway is intuitive and user-friendly
• **Pain Point Severity**: The problem creates enough friction to drive user adoption

**Areas for Enhancement:**
- Conduct more user interviews to validate problem severity
- Consider edge cases and secondary problems your solution could address
- Develop a more comprehensive understanding of user workflows
- Test assumptions about user behavior and preferences`
    },
    {
      id: "target-audience",
      icon: "👥",
      title: "Target Audience Analysis",
      score: 6.8,
      status: "moderate",
      summary: "Target audience is identified but needs more specific segmentation",
      details: `Your target audience analysis reveals:

• **Market Size**: Addressable market appears substantial with growth potential
• **Demographics**: Basic demographic profiling is present but could be more detailed
• **Psychographics**: Understanding of user motivations and behaviors needs development
• **Accessibility**: Your target audience is reachable through known channels

**Recommendations:**
- Create detailed user personas with specific pain points and goals
- Segment your audience into primary, secondary, and tertiary groups
- Research communication preferences and media consumption habits
- Identify early adopters who would be most eager to try your solution
- Map the customer journey from awareness to purchase decision`
    },
    {
      id: "competitor-analysis",
      icon: "⚔️",
      title: "Competitive Landscape",
      score: 9.1,
      status: "strong",
      summary: "Competitive positioning is strong with clear differentiation",
      details: `Competitive analysis highlights:

• **Market Position**: Your solution occupies a unique position in the competitive landscape
• **Differentiation**: Clear competitive advantages that are difficult to replicate
• **Barrier to Entry**: Your approach creates meaningful barriers for competitors
• **Market Gaps**: You're addressing underserved segments effectively

**Competitive Advantages:**
- First-mover advantage in a specific niche
- Superior user experience compared to existing solutions
- More cost-effective approach than current alternatives
- Better integration capabilities with existing tools

**Competitive Risks:**
- Monitor larger players who might enter your market
- Stay ahead of feature development to maintain your edge`
    },
    {
      id: "go-to-market",
      icon: "🚀",
      title: "Go-to-Market Strategy",
      score: 5.9,
      status: "needs-work",
      summary: "Go-to-market approach requires more strategic development",
      details: `Your go-to-market strategy assessment:

• **Channel Strategy**: Initial channel selection is reasonable but limited
• **Pricing Model**: Pricing strategy needs more research and validation
• **Marketing Approach**: Marketing tactics are basic and need more sophistication
• **Sales Process**: Sales funnel requires more detailed planning

**Critical Improvements Needed:**
- Develop a multi-channel distribution strategy
- Create a comprehensive content marketing plan
- Establish partnership opportunities for faster market penetration
- Design a customer acquisition cost (CAC) optimization strategy
- Plan for customer retention and upselling opportunities

**Recommended Next Steps:**
1. Conduct competitor pricing analysis
2. Test different marketing messages with target audience
3. Build relationships with potential strategic partners
4. Create a detailed launch timeline with measurable milestones`
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "strong": return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "moderate": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "needs-work": return <XCircle className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  const averageScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Your Startup Validation Report
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            Here's how your idea scored across key startup metrics
          </p>
          
          {/* Overall Score */}
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}
              </div>
              <div className="text-slate-400">Overall Validation Score</div>
            </div>
          </div>
        </div>

        {/* Validation Results */}
        <div className="space-y-6 mb-12">
          {validationResults.map((result, index) => (
            <Collapsible
              key={result.id}
              open={openSections[result.id]}
              onOpenChange={() => toggleSection(result.id)}
            >
              <Card className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors duration-300">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-slate-800/50 transition-colors duration-200">
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{result.icon}</span>
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{result.title}</span>
                            {getStatusIcon(result.status)}
                          </div>
                          <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}/10
                          </div>
                        </div>
                      </div>
                      {openSections[result.id] ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </CardTitle>
                    <p className="text-slate-400 text-left">{result.summary}</p>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {result.details}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-8"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try New Idea
          </Button>
          
          <Button
            onClick={() => alert("Export functionality will be added with Supabase integration")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </Button>
          
          <Button
            onClick={() => alert("Share functionality will be added with Supabase integration")}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-8"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Copy Report Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
