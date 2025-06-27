
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const NavigationButtons = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const requireAuth = (action: () => void) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    action();
  };

  const handleSavedReports = () => {
    requireAuth(() => {
      navigate("/saved-reports");
    });
  };

  return (
    <>
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
          onClick={handleSavedReports}
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 h-12 px-4 flex-shrink-0 text-sm lg:text-base"
        >
          <FileText className="w-5 h-5 mr-2" />
          Saved Reports
        </Button>
      </motion.div>
    </>
  );
};
