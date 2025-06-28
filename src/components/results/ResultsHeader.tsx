
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
      return "text-green-400";
    case "moderate":
      return "text-yellow-400";
    case "needs-work":
    case "weak":
      return "text-red-400";
    default:
      return "text-slate-400";
  }
};

export const ResultsHeader = ({ averageScore, validationResults }: ResultsHeaderProps) => {
  const [showDetails, setShowDetails] = useState(false);

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
          <CollapsibleTrigger className="w-full">
            <div className="text-center cursor-pointer hover:bg-white/5 transition-colors duration-200 rounded-lg p-2">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <span>Overall Validation Score</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-6 space-y-4">
              <div className="text-sm text-slate-300 mb-4">
                Detailed breakdown of your validation results:
              </div>
              {validationResults.map((result) => (
                <div key={result.id} className="bg-slate-800/50 rounded-lg p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{result.icon}</span>
                      <span className="text-white font-medium text-sm">{result.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(result.score)}`}>
                        {result.score}/10
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(result.status)} bg-slate-700/50`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              ))}
              <div className="text-xs text-slate-500 mt-4 p-2 bg-slate-900/50 rounded">
                Average calculated from {validationResults.length} validation tools
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
