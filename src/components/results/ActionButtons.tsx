
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SaveReportButton } from "./actions/SaveReportButton";
import { ExportPdfButton } from "./actions/ExportPdfButton";
import { NavigationButtons } from "./actions/NavigationButtons";

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

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    action();
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row lg:flex-row gap-4 justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <NavigationButtons />
      
      <ExportPdfButton />
      
      <SaveReportButton 
        validationResults={validationResults}
        averageScore={averageScore}
      />
    </motion.div>
  );
};
