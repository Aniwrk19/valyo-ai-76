import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ValidationResult {
  id: string;
  icon: string;
  title: string;
  score: number;
  status: string;
  summary: string;
  details: string;
}

interface ResultsHeaderProps {
  averageScore: number;
  validationResults: ValidationResult[];
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "strong":
    case "good":
      return "text-green-400 bg-green-900/30";
    case "moderate":
      return "text-yellow-400 bg-yellow-900/30";
    case "needs-work":
    case "weak":
      return "text-red-400 bg-red-900/30";
    default:
      return "text-slate-400 bg-slate-700/30";
  }
};

export const ResultsHeader = ({ averageScore, validationResults }: ResultsHeaderProps) => {
  const [showDetails, setShowDetails] = useState(false);

  console.log('ResultsHeader - Average Score:', averageScore);
  console.log('ResultsHeader - Validation Results:', validationResults);

  const displayScore = typeof averageScore === 'number' && !isNaN(averageScore) ? averageScore : 0;

  return (
    <div className="text-center mb-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
        Your Startup Validation Report
      </h1>
      <p className="text-xl text-slate-400 mb-6">
        Here's how your idea scored across key startup metrics
      </p>
      
      {/* Overall Score */}
      <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 max-w-md mx-auto">
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <button className="w-full cursor-pointer hover:bg-white/5 transition-colors duration-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${getScoreColor(displayScore)}`}>
                  {displayScore.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
                  <span>Overall Validation Score</span>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-6 space-y-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="text-sm text-slate-300 mb-4 font-medium">
                Detailed breakdown of your validation results:
              </div>
              {validationResults && validationResults.length > 0 ? (
                <div className="space-y-4">
                  {validationResults.map((result) => (
                    <div key={result.id} className="bg-slate-900/40 rounded-lg p-4 text-left border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{result.icon}</span>
                          <span className="text-white font-semibold text-sm">{result.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${getScoreColor(result.score)}`}>
                            {result.score}/10
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-slate-300 text-xs font-medium mb-1">Summary:</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {result.summary}
                        </p>
                      </div>
                      
                      {result.details && (
                        <div className="border-t border-slate-700/50 pt-3">
                          <div className="text-slate-300 text-xs font-medium mb-2">Detailed Analysis:</div>
                          <div className="text-slate-300 text-xs leading-relaxed">
                            <div className="whitespace-pre-line">{result.details}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm text-center py-4">
                  No validation results available
                </div>
              )}
              
              <div className="text-xs text-slate-500 mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 text-center">
                Average calculated from {validationResults?.length || 0} validation tools
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
