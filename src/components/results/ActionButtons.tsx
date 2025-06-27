
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const [exporting, setExporting] = useState(false);

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

  const handleExportReport = async () => {
    requireAuth(async () => {
      setExporting(true);
      try {
        const businessIdea = localStorage.getItem("businessIdea");
        
        if (!businessIdea) {
          throw new Error("Business idea not found");
        }

        console.log('Generating document report...');
        
        // Get the current session to include the access token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error("No valid session found");
        }

        const response = await fetch(
          `https://dsdhpddjdcaoyhbygfeg.supabase.co/functions/v1/generate-pdf-report`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              validationResults,
              averageScore,
              businessIdea
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Determine file type and extension from response headers
        const contentType = response.headers.get('content-type');
        const contentDisposition = response.headers.get('content-disposition');
        let fileExtension = 'pdf';
        let fileType = 'PDF';
        
        if (contentType?.includes('text/html')) {
          fileExtension = 'html';
          fileType = 'HTML';
        }

        // Create a download link for the document
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `validation-report-${Date.now()}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Report exported!",
          description: `Your validation report has been downloaded as a ${fileType} and saved to your account.`,
        });
      } catch (error: any) {
        console.error('Export error:', error);
        toast({
          title: "Error exporting report",
          description: error.message || "Failed to generate document. Please try again.",
          variant: "destructive"
        });
      } finally {
        setExporting(false);
      }
    });
  };

  const handleSavedReports = () => {
    requireAuth(() => {
      navigate("/saved-reports");
    });
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row lg:flex-row gap-4 justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try New Idea
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleExportReport}
          disabled={exporting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
        >
          <Download className="w-5 h-5 mr-2" />
          {exporting ? "Generating..." : "Export Report"}
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleSaveReport}
          disabled={saving}
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Saving..." : "Save Report"}
        </Button>
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleSavedReports}
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
        >
          <FileText className="w-5 h-5 mr-2" />
          Saved Reports
        </Button>
      </motion.div>
    </motion.div>
  );
};
