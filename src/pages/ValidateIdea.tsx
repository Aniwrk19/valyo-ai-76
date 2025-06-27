import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Users, Zap, ArrowRight, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserDropdown } from "@/components/layout/UserDropdown";

interface Tool {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const ValidateIdea = () => {
  const [businessIdea, setBusinessIdea] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([
    "business-idea",
    "problem-solution", 
    "target-audience",
    "go-to-market"
  ]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const validationTools = [
    {
      id: "business-idea",
      icon: Brain,
      title: "Business Idea Analysis",
      description: "Deep dive into your concept's uniqueness and market positioning"
    },
    {
      id: "problem-solution",
      icon: Target,
      title: "Problem-Solution Fit",
      description: "Evaluate how well your solution addresses the identified problem"
    },
    {
      id: "target-audience",
      icon: Users,
      title: "Target Audience Research",
      description: "Identify and analyze your ideal customer segments"
    },
    {
      id: "go-to-market",
      icon: Zap,
      title: "Go-to-Market Strategy",
      description: "Plan your market entry and customer acquisition approach"
    }
  ];

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleValidate = () => {
    if (!businessIdea.trim()) return;
    
    localStorage.setItem("businessIdea", businessIdea);
    localStorage.setItem("selectedTools", JSON.stringify(selectedTools));
    navigate("/processing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header with User Dropdown */}
        <div className="flex items-center justify-between mb-12">
          <motion.div 
            className="text-center flex-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Lightbulb className="w-12 h-12 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Validate Your Startup Idea
              </h1>
            </div>
            <p className="text-xl text-slate-400">
              Get AI-powered insights to evaluate your business concept
            </p>
          </motion.div>
          
          {user && (
            <div className="absolute top-8 right-8">
              <UserDropdown />
            </div>
          )}
          
          {!user && (
            <div className="absolute top-8 right-8">
              <Button 
                onClick={() => navigate("/auth")}
                variant="outline" 
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 text-sm px-3 py-2 h-auto"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Business Idea Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-6">
              <label htmlFor="business-idea" className="block text-lg font-semibold text-white mb-3">
                Describe your business idea
              </label>
              <Textarea
                id="business-idea"
                placeholder="Tell us about your startup idea. What problem does it solve? Who are your customers? What makes it unique?"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                className="min-h-32 bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none focus:border-blue-500 focus:ring-blue-500"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Validation Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Choose validation tools
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {validationTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedTools.includes(tool.id)
                      ? 'bg-blue-900/30 border-blue-400/50 ring-1 ring-blue-400/30'
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/50'
                  }`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        selectedTools.includes(tool.id)
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-slate-700'
                      }`}>
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {tool.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {tool.description}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded border-2 ${
                          selectedTools.includes(tool.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-600'
                        }`}>
                          {selectedTools.includes(tool.id) && (
                            <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Validate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center"
        >
          <Button
            onClick={handleValidate}
            disabled={!businessIdea.trim() || selectedTools.length === 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Validate My Idea
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ValidateIdea;
