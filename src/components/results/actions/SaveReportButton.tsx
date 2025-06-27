
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
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

interface SaveReportButtonProps {
  validationResults: ValidationResult[];
  averageScore: number;
}

export const SaveReportButton = ({ validationResults, averageScore }: SaveReportButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!user) return;
    
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
          user_id: user.id,
          description: businessIdea,
          selected_tools: JSON.parse(selectedTools),
          title: businessIdea.substring(0, 100) + (businessIdea.length > 100 ? '...' : '')
        })
        .select()
        .single();

      if (ideaError) throw ideaError;

      // Then, save the validation report
      const { error: reportError } = await supabase
        .from('validation_reports')
        .insert({
          user_id: user.id,
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
  };

  return (
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
  );
};
