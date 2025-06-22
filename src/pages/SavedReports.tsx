
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedReport {
  id: string;
  business_idea: {
    id: string;
    title: string;
    description: string;
    selected_tools: string[];
  };
  report_data: any[];
  average_score: number;
  created_at: string;
}

const SavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_reports')
        .select(`
          id,
          report_data,
          average_score,
          created_at,
          business_idea:business_ideas (
            id,
            title,
            description,
            selected_tools
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewReport = (report: SavedReport) => {
    // Store the report data in localStorage for the Results page
    localStorage.setItem("businessIdea", report.business_idea.description);
    localStorage.setItem("selectedTools", JSON.stringify(report.business_idea.selected_tools));
    navigate("/results");
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('validation_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.filter(report => report.id !== reportId));
      toast({
        title: "Report deleted",
        description: "The report has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting report",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const truncateIdea = (idea: string, maxLength: number = 100) => {
    return idea.length > maxLength ? idea.substring(0, maxLength) + "..." : idea;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={() => navigate("/")} 
            variant="outline" 
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 text-sm px-3 py-2 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-center flex-1">
            Saved Reports
          </h1>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400 mb-2">No saved reports yet</h2>
            <p className="text-slate-500 mb-8">Start validating your ideas to create your first report</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Validate New Idea
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report, index) => (
              <Card key={report.id} className="bg-slate-900/50 border-slate-700 hover:bg-slate-900/70 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between text-white">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="text-lg font-semibold">Validation Report #{reports.length - index}</span>
                        <span className="px-2 py-1 bg-blue-600/20 border border-blue-400/30 rounded text-xs text-slate-400">
                          Score: {report.average_score?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{formatDate(report.created_at)}</p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {truncateIdea(report.business_idea.description)}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-slate-400 text-sm">Tools used:</span>
                    {report.business_idea.selected_tools.map((tool, toolIndex) => (
                      <span key={toolIndex} className="px-2 py-1 bg-blue-600/20 border border-blue-400/30 rounded text-xs text-slate-400">
                        {tool.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={() => handleViewReport(report)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Eye className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                    
                    <Button onClick={() => toast({ title: "Edit functionality coming soon" })} variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    
                    <Button onClick={() => handleDeleteReport(report.id)} variant="outline" className="bg-red-900/20 border-red-600/30 text-red-400 hover:bg-red-900/40">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedReports;
