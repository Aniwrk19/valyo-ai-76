
import { Card, CardContent } from "@/components/ui/card";

interface ResultsHeaderProps {
  averageScore: number;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
};

export const ResultsHeader = ({ averageScore }: ResultsHeaderProps) => {
  return (
    <div className="text-center mb-12 animate-fade-in" data-export="results-header">
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
  );
};
