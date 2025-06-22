
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, RotateCcw, Download, Share2, CheckCircle, AlertTriangle, XCircle, ThumbsUp, ThumbsDown, Save, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const tools = localStorage.getItem("selectedTools");
    if (tools) {
      setSelectedTools(JSON.parse(tools));
    }
  }, []);

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    action();
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const allValidationResults = [
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

  const validationResults = allValidationResults.filter(result => selectedTools.includes(result.id));

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

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive);
    if (isPositive) {
      setFeedbackText("");
    }
  };

  const handleSaveReport = async () => {
    requireAuth(async () => {
      setSaving(true);
      try {
        const businessIdea = localStorage.getItem("businessIdea");
        
        // First, save the business idea
        const { data: ideaData, error: ideaError } = await supabase
          .from('business_ideas')
          .insert({
            user_id: user!.id,
            description: businessIdea || '',
            selected_tools: selectedTools,
            title: businessIdea?.substring(0, 100) + (businessIdea && businessIdea.length > 100 ? '...' : '')
          })
          .select()
          .single();

        if (ideaError) throw ideaError;

        // Then, save the validation report
        const { error: reportError } = await supabase
          .from('validation_reports')
          .insert({
            user_id: user!.id,
            business_idea_id: ideaData.id,
            report_data: validationResults,
            average_score: averageScore
          });

        if (reportError) throw reportError;

        toast({
          title: "Report saved!",
          description: "Your validation report has been saved to your account.",
        });
      } catch (error: any) {
        toast({
          title: "Error saving report",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleExportReport = () => {
    requireAuth(() => {
      toast({
        title: "Export feature coming soon",
        description: "PDF export will be available once Documate integration is complete.",
      });
    });
  };

  const handleSavedReports = () => {
    requireAuth(() => {
      navigate("/saved-reports");
    });
  };

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
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-2xl">{result.icon}</span>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <span className="text-lg">{result.title}</span>
                            <div className="flex items-center gap-2 md:hidden">
                              {getStatusIcon(result.status)}
                              <span className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                                {result.score}/10
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="hidden md:flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}/10
                          </div>
                        </div>
                        {openSections[result.id] ? (
                          <ChevronUp className="w-6 h-6 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
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

        {/* Feedback Section */}
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">Was this helpful?</h3>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={() => handleFeedback(true)}
              variant={feedbackGiven === true ? "default" : "outline"}
              className={`h-12 px-6 ${feedbackGiven === true ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              Yes
            </Button>
            <Button
              onClick={() => handleFeedback(false)}
              variant={feedbackGiven === false ? "default" : "outline"}
              className={`h-12 px-6 ${feedbackGiven === false ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
            >
              <ThumbsDown className="w-5 h-5 mr-2" />
              No
            </Button>
          </div>
          
          {feedbackGiven === false && (
            <div className="space-y-4">
              <Textarea
                placeholder="What could be improved?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={() => toast({ title: "Thank you for your feedback!" })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Submit Feedback
              </Button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try New Idea
          </Button>
          
          <Button
            onClick={handleExportReport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </Button>
          
          <Button
            onClick={handleSaveReport}
            disabled={saving}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "Saving..." : "Save Report"}
          </Button>
          
          <Button
            onClick={handleSavedReports}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
          >
            <FileText className="w-5 h-5 mr-2" />
            Saved Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
