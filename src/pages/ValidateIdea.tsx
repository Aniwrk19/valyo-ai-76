import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Sparkles, Zap } from "lucide-react";
const ValidateIdea = () => {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();
  const handleValidate = () => {
    if (idea.trim()) {
      // Store the idea in localStorage for the results page
      localStorage.setItem("businessIdea", idea);
      navigate("/processing");
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="relative">
              <Lightbulb className="w-12 h-12 text-blue-400" />
              <Sparkles className="w-6 h-6 text-purple-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6 leading-tight py-0 mx-[3px]">
            Validate your startup idea instantly using AI
          </h1>
          
          <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Enter your idea and we'll analyze it using 5 expert startup validation tools
          </p>
        </div>

        {/* Input Section */}
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl mb-8">
          <div className="space-y-6">
            <div className="relative">
              <Textarea placeholder="Describe your business idea in detail... What problem does it solve? Who is your target audience? How will you make money?" value={idea} onChange={e => setIdea(e.target.value)} className="min-h-[200px] bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl" />
            </div>
            
            <Button onClick={handleValidate} disabled={!idea.trim()} className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
              <Zap className="w-6 h-6 mr-2" />
              Validate Now
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[{
          icon: "💡",
          title: "Idea Validation",
          desc: "AI-powered analysis"
        }, {
          icon: "👥",
          title: "Market Research",
          desc: "Target audience insights"
        }, {
          icon: "🚀",
          title: "Go-to-Market",
          desc: "Strategic recommendations"
        }].map((feature, index) => <div key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors duration-300">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>)}
        </div>
      </div>
    </div>;
};
export default ValidateIdea;