
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Brain, Zap, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Processing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Get selected tools from localStorage
    const tools = localStorage.getItem("selectedTools");
    const businessIdea = localStorage.getItem("businessIdea");
    
    if (tools && businessIdea) {
      setSelectedTools(JSON.parse(tools));
      
      // Start validation process
      validateIdea(businessIdea, JSON.parse(tools));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const validateIdea = async (businessIdea: string, tools: string[]) => {
    try {
      // Simulate step progression
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < tools.length - 1) {
            return prev + 1;
          } else {
            clearInterval(stepInterval);
            return prev;
          }
        });
      }, 800);

      console.log('Calling OpenAI validation...');
      
      const { data, error } = await supabase.functions.invoke('validate-idea', {
        body: {
          businessIdea,
          selectedTools: tools
        }
      });

      clearInterval(stepInterval);

      if (error) {
        console.error('Validation error:', error);
        throw error;
      }

      console.log('Validation results:', data);

      // Store results in localStorage for the Results page
      localStorage.setItem("validationResults", JSON.stringify(data.results));
      localStorage.setItem("averageScore", data.averageScore.toString());

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate("/results");
      }, 1000);

    } catch (error: any) {
      console.error('Error during validation:', error);
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate your idea. Please try again.",
        variant: "destructive"
      });
      
      // Navigate back to home on error
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  const allSteps = [
    { id: "business-idea", icon: Brain, label: "Business Idea Analysis", delay: 0 },
    { id: "problem-solution", icon: Target, label: "Problem-Solution Fit", delay: 500 },
    { id: "target-audience", icon: Users, label: "Target Audience Research", delay: 1000 },
    { id: "go-to-market", icon: Zap, label: "Go-to-Market Strategy", delay: 1500 }
  ];

  const activeSteps = allSteps.filter(step => selectedTools.includes(step.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Main Loading Animation */}
        <div className="mb-12">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-12 h-12 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 px-2 py-2">
            Analyzing your idea...
          </h1>
          
          <p className="text-xl text-slate-400 mb-8">
            Running {activeSteps.length} AI-powered validation tools
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4">
          {activeSteps.map((step, index) => (
            <AnalysisStep
              key={step.id}
              icon={step.icon}
              label={step.label}
              delay={step.delay}
              isActive={index <= currentStep}
              isCompleted={index < currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalysisStep = ({ 
  icon: Icon, 
  label, 
  delay, 
  isActive, 
  isCompleted 
}: { 
  icon: any, 
  label: string, 
  delay: number,
  isActive: boolean,
  isCompleted: boolean
}) => {
  return (
    <div 
      className={`flex items-center justify-center gap-4 p-4 backdrop-blur-sm border rounded-xl transition-all duration-500 ${
        isCompleted 
          ? 'bg-green-900/20 border-green-400/30' 
          : isActive 
            ? 'bg-blue-900/20 border-blue-400/30' 
            : 'bg-white/5 border-white/10'
      } animate-fade-in opacity-0`}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
        isCompleted 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
          : isActive 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
            : 'bg-slate-700'
      }`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white font-medium flex-1 text-left">{label}</span>
      {isCompleted ? (
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : isActive ? (
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-slate-600" />
      )}
    </div>
  );
};

export default Processing;
