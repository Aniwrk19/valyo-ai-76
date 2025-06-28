
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
    
    if (results) {
      const parsedResults = JSON.parse(results);
      console.log('Loaded validation results:', parsedResults);
      setValidationResults(parsedResults);
      
      // Calculate proper average score ensuring it's under 10
      const validScores = parsedResults
        .map((result: ValidationResult) => result.score)
        .filter((score: number) => typeof score === 'number' && !isNaN(score) && score > 0);
        
      console.log('Valid scores for average calculation:', validScores);
        
      if (validScores.length > 0) {
        const sum = validScores.reduce((total: number, score: number) => total + score, 0);
        const calculatedAverage = sum / validScores.length;
        
        // Ensure the average is never above 10 and round to 1 decimal place
        const finalAverage = Math.min(calculatedAverage, 10);
        const roundedAverage = Math.round(finalAverage * 10) / 10;
        
        console.log('Calculated average score:', roundedAverage);
        setAverageScore(roundedAverage);
        
        // Store the calculated average in localStorage for consistency
        localStorage.setItem("averageScore", roundedAverage.toString());
      } else {
        console.log('No valid scores found, setting average to 0');
        setAverageScore(0);
        localStorage.setItem("averageScore", "0");
      }
    } else {
      console.log('No validation results found, redirecting to home');
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
        <ResultsHeader averageScore={averageScore} validationResults={validationResults} />

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
