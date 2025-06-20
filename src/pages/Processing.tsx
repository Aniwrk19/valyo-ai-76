
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Brain, Zap, Target, Users, TrendingUp } from "lucide-react";

const Processing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const analysisSteps = [
    { icon: Brain, label: "Business Idea Analysis", delay: 0 },
    { icon: Target, label: "Problem-Solution Fit", delay: 500 },
    { icon: Users, label: "Target Audience Research", delay: 1000 },
    { icon: TrendingUp, label: "Market Competition", delay: 1500 },
    { icon: Zap, label: "Go-to-Market Strategy", delay: 2000 }
  ];

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

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Analyzing your idea...
          </h1>
          
          <p className="text-xl text-slate-400 mb-8">
            Running 5 expert tools to validate your startup. Just a moment.
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4">
          {analysisSteps.map((step, index) => (
            <AnalysisStep
              key={index}
              icon={step.icon}
              label={step.label}
              delay={step.delay}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalysisStep = ({ icon: Icon, label, delay }: { icon: any, label: string, delay: number }) => {
  return (
    <div 
      className="flex items-center justify-center gap-4 p-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl animate-fade-in opacity-0"
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-white font-medium">{label}</span>
      <Loader2 className="w-5 h-5 text-blue-400 animate-spin ml-auto" />
    </div>
  );
};

export default Processing;
