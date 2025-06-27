
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ValidationResult {
  id: string;
  icon: string;
  title: string;
  score: number;
  status: string;
  summary: string;
  details: string | Array<{
    aspect: string;
    score: number;
    analysis: string;
    recommendations: string[];
  }>;
}

interface ValidationResultCardProps {
  result: ValidationResult;
  isOpen: boolean;
  onToggle: () => void;
}

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

const renderDetails = (details: string | Array<any>) => {
  // If it's a string, render as is
  if (typeof details === 'string') {
    return (
      <div className="text-slate-300 whitespace-pre-line leading-relaxed">
        {details}
      </div>
    );
  }

  // If it's an array of structured data, render it properly
  if (Array.isArray(details)) {
    return (
      <div className="space-y-6">
        {details.map((item, index) => (
          <div key={index} className="border-l-4 border-blue-500/30 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold text-white">{item.aspect}</h4>
              {item.score && (
                <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(item.score)} bg-slate-800`}>
                  {item.score}/10
                </span>
              )}
            </div>
            
            {item.analysis && (
              <div className="mb-3">
                <p className="text-slate-300 leading-relaxed">{item.analysis}</p>
              </div>
            )}
            
            {item.recommendations && item.recommendations.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-blue-400 mb-2">Recommendations:</h5>
                <ul className="space-y-1 text-slate-300">
                  {item.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-sm leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Fallback for any other data type
  return (
    <div className="text-slate-300 whitespace-pre-line leading-relaxed">
      {JSON.stringify(details, null, 2)}
    </div>
  );
};

export const ValidationResultCard = ({ result, isOpen, onToggle }: ValidationResultCardProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
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
                {isOpen ? (
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
              {renderDetails(result.details)}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
