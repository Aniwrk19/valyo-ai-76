
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RotateCcw, Download, Save, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  id: string;
  icon: string;
  title: string;
  score: number;
  status: string;
  summary: string;
  details: string;
}

interface ActionButtonsProps {
  validationResults: ValidationResult[];
  averageScore: number;
}

export const ActionButtons = ({ validationResults, averageScore }: ActionButtonsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    action();
  };

  const handleSaveReport = async () => {
    requireAuth(async () => {
      setSaving(true);
      try {
        const businessIdea = localStorage.getItem("businessIdea");
        const selectedTools = localStorage.getItem("selectedTools");
        
        if (!businessIdea || !selectedTools) {
          throw new Error("Missing business idea or selected tools");
        }

        // First, save the business idea
        const { data: ideaData, error: ideaError } = await supabase
          .from('business_ideas')
          .insert({
            user_id: user!.id,
            description: businessIdea,
            selected_tools: JSON.parse(selectedTools),
            title: businessIdea.substring(0, 100) + (businessIdea.length > 100 ? '...' : '')
          })
          .select()
          .single();

        if (ideaError) throw ideaError;

        // Then, save the validation report - cast validationResults to Json type
        const { error: reportError } = await supabase
          .from('validation_reports')
          .insert({
            user_id: user!.id,
            business_idea_id: ideaData.id,
            report_data: validationResults as any,
            average_score: averageScore
          });

        if (reportError) throw reportError;

        toast({
          title: "Report saved!",
          description: "Your validation report has been saved to your account.",
        });
      } catch (error: any) {
        toast({
          title: "Error saving report",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleExportReport = () => {
    requireAuth(() => {
      toast({
        title: "Export feature coming soon",
        description: "PDF export will be available once Documate integration is complete.",
      });
    });
  };

  const handleSavedReports = () => {
    requireAuth(() => {
      navigate("/saved-reports");
    });
  };

  return (
    <div className="flex flex-col sm:flex-row lg:flex-row gap-4 justify-center">
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        Try New Idea
      </Button>
      
      <Button
        onClick={handleExportReport}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
      >
        <Download className="w-5 h-5 mr-2" />
        Export Report
      </Button>
      
      <Button
        onClick={handleSaveReport}
        disabled={saving}
        variant="outline"
        className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
      >
        <Save className="w-5 h-5 mr-2" />
        {saving ? "Saving..." : "Save Report"}
      </Button>
      
      <Button
        onClick={handleSavedReports}
        variant="outline"
        className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
      >
        <FileText className="w-5 h-5 mr-2" />
        Saved Reports
      </Button>
    </div>
  );
};
