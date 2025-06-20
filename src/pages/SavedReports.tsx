import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Edit, Trash2, ArrowLeft } from "lucide-react";
interface SavedReport {
  idea: string;
  tools: string[];
  results: any[];
  timestamp: string;
}
const SavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem("savedReports") || "[]");
    setReports(savedReports);
  }, []);
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const handleViewReport = (index: number) => {
    const report = reports[index];
    localStorage.setItem("businessIdea", report.idea);
    localStorage.setItem("selectedTools", JSON.stringify(report.tools));
    navigate("/results");
  };
  const handleDeleteReport = (index: number) => {
    const updatedReports = reports.filter((_, i) => i !== index);
    setReports(updatedReports);
    localStorage.setItem("savedReports", JSON.stringify(updatedReports));
  };
  const truncateIdea = (idea: string, maxLength: number = 100) => {
    return idea.length > maxLength ? idea.substring(0, maxLength) + "..." : idea;
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => navigate("/")} variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Saved Reports
          </h1>
        </div>

        {reports.length === 0 ? <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400 mb-2">No saved reports yet</h2>
            <p className="text-slate-500 mb-8">Start validating your ideas to create your first report</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Validate New Idea
            </Button>
          </div> : <div className="space-y-6">
            {reports.map((report, index) => <Card key={index} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between text-white">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-semibold">Validation Report #{reports.length - index}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{formatDate(report.timestamp)}</p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {truncateIdea(report.idea)}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-slate-400 text-sm">Tools used:</span>
                    {report.tools.map((tool, toolIndex) => <span key={toolIndex} className="px-2 py-1 bg-blue-600/20 border border-blue-400/30 rounded text-xs text-slate-400">
                        {tool.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>)}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={() => handleViewReport(index)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    
                    <Button onClick={() => alert("Edit functionality will be added with HelloSign integration")} variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button onClick={() => handleDeleteReport(index)} variant="outline" className="bg-red-900/20 border-red-600/30 text-red-400 hover:bg-red-900/40">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </div>;
};
export default SavedReports;