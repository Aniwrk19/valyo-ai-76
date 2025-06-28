
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
  details: string;
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

const renderDetails = (details: any) => {
  if (typeof details === 'string') {
    return <div className="whitespace-pre-line leading-relaxed text-slate-300">{details}</div>;
  }
  
  if (Array.isArray(details)) {
    return (
      <div className="space-y-2">
        {details.map((item, index) => (
          <div key={index} className="text-sm text-slate-300">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  }
  
  if (typeof details === 'object' && details !== null) {
    return <div className="text-slate-300">Analysis details are available in structured format but cannot be displayed properly.</div>;
  }
  
  return <div className="text-slate-300">No detailed analysis available.</div>;
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
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <h4 className="text-slate-200 font-medium mb-3 text-sm">Detailed Analysis:</h4>
                {renderDetails(result.details)}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
