
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Zap, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Tool {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const ValidateIdea = () => {
  const [idea, setIdea] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const tools: Tool[] = [{
    id: "business-idea",
    icon: "💡",
    title: "Business Idea Validator",
    description: "Evaluates originality, demand, feasibility, and scalability"
  }, {
    id: "problem-solution",
    icon: "❓",
    title: "Problem-Solution Fit",
    description: "Checks if the idea addresses a real, validated pain point"
  }, {
    id: "target-audience",
    icon: "👥",
    title: "Target Audience",
    description: "Builds customer personas with goals, pain points, and behaviors"
  }, {
    id: "go-to-market",
    icon: "🚀",
    title: "Go-to-Market Strategy",
    description: "Suggests channels, launch plans, pricing strategies, and KPIs"
  }];

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]);
  };

  const handleValidate = () => {
    if (idea.trim()) {
      // Store the idea and selected tools in localStorage
      localStorage.setItem("businessIdea", idea);
      localStorage.setItem("selectedTools", JSON.stringify(selectedTools.length > 0 ? selectedTools : tools.map(t => t.id)));
      navigate("/processing");
    }
  };

  const handleSignIn = () => {
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-blue-400" />
          <span className="text-lg font-light text-white">Valyo AI</span>
        </div>
      </div>

      {/* Authentication Status - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        {user ? (
          <div className="flex items-center gap-2 text-slate-300">
            <User className="w-6 h-6 p-1 bg-slate-800 border border-slate-600 rounded-full text-blue-400" />
            <span className="text-blue-400 font-medium text-sm hidden sm:inline">
              {user.user_metadata?.username || user.email}
            </span>
          </div>
        ) : (
          <Button
            onClick={handleSignIn}
            variant="outline"
            size="sm"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 text-xs px-2 py-1 h-7"
          >
            Sign In
          </Button>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in relative pt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6 leading-tight px-2 py-2">
            Validate your startup idea instantly using AI
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            Enter your idea and pick the tools to validate it
          </p>
        </div>

        {/* Input Section */}
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="space-y-6">
            <div className="relative">
              <Textarea 
                placeholder="Describe your business idea in detail... What problem does it solve? Who is your target audience? How will you make money?" 
                value={idea} 
                onChange={e => setIdea(e.target.value)} 
                className="min-h-[200px] bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl" 
              />
            </div>
          </div>
        </div>

        {/* Tool Selection - 2x2 Grid */}
        <div className="mb-8">
          <p className="text-xl text-slate-300 text-center mb-6">Choose any AI tool</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {tools.map(tool => 
              <div key={tool.id} onClick={() => toggleTool(tool.id)} className={`backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedTools.includes(tool.id) ? 'bg-blue-600/20 border-blue-400/50 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <h3 className="text-white font-semibold mb-1 text-sm">{tool.title}</h3>
                  <p className="text-slate-400 text-xs">{tool.description}</p>
                </div>
              </div>
            )}
          </div>
          
          {selectedTools.length === 0 && <p className="text-center text-sm mt-4 text-slate-400">
              No tools selected - all 4 tools will run by default
            </p>}
        </div>

        {/* Validate Button */}
        <div className="text-center">
          <Button onClick={handleValidate} disabled={!idea.trim()} className="h-14 px-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
            <Zap className="w-6 h-6 mr-2" />
            Validate Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ValidateIdea;
