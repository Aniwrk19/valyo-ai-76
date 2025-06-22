
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { ValidationResultCard } from "@/components/results/ValidationResultCard";
import { FeedbackSection } from "@/components/results/FeedbackSection";
import { ActionButtons } from "@/components/results/ActionButtons";

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);

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

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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
        <ResultsHeader averageScore={averageScore} />

        {/* Validation Results */}
        <div className="space-y-6 mb-12">
          {validationResults.map((result) => (
            <ValidationResultCard
              key={result.id}
              result={result}
              isOpen={openSections[result.id]}
              onToggle={() => toggleSection(result.id)}
            />
          ))}
        </div>

        <FeedbackSection />

        <ActionButtons 
          validationResults={validationResults}
          averageScore={averageScore}
        />
      </div>
    </div>
  );
};

export default Results;
