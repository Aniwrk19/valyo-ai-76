
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, RotateCcw, Download, CheckCircle, AlertTriangle, XCircle, ThumbsUp, ThumbsDown, Save, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  id: string;
  icon: string;
  title: string;
  score: number;
  status: string;
  summary: string;
  details: string;
}

const Results = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load results from localStorage
    const results = localStorage.getItem("validationResults");
    const avgScore = localStorage.getItem("averageScore");
    
    if (results && avgScore) {
      setValidationResults(JSON.parse(results));
      setAverageScore(parseFloat(avgScore));
    } else {
      // If no results, redirect to home
      navigate("/");
    }
  }, [navigate]);

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
        const selectedTools = localStorage.getItem("selectedTools");
        
        if (!businessIdea || !selectedTools) {
          throw new Error("Missing business idea or selected tools");
        }

        // First, save the business idea
        const { data: ideaData, error: ideaError } = await supabase
          .from('business_ideas')
          .insert({
            user_id: user!.id,
            description: businessIdea,
            selected_tools: JSON.parse(selectedTools),
            title: businessIdea.substring(0, 100) + (businessIdea.length > 100 ? '...' : '')
          })
          .select()
          .single();

        if (ideaError) throw ideaError;

        // Then, save the validation report - cast validationResults to Json type
        const { error: reportError } = await supabase
          .from('validation_reports')
          .insert({
            user_id: user!.id,
            business_idea_id: ideaData.id,
            report_data: validationResults as any,
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

  if (validationResults.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

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
          {validationResults.map((result) => (
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
