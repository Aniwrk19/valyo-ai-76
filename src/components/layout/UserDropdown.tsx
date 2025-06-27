
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasSavedReports, setHasSavedReports] = useState(false);

  useEffect(() => {
    if (user) {
      checkForSavedReports();
    }
  }, [user]);

  const checkForSavedReports = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_reports')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1);

      if (!error && data && data.length > 0) {
        setHasSavedReports(true);
      }
    } catch (error) {
      console.error('Error checking for saved reports:', error);
    }
  };

  if (!user) return null;

  const displayName = user.email?.split('@')[0] || 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 text-sm px-3 py-2 h-auto"
        >
          <User className="w-4 h-4 mr-2" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-slate-800 border-slate-600 text-white"
        align="end"
      >
        {hasSavedReports && (
          <DropdownMenuItem
            onClick={() => navigate("/saved-reports")}
            className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Saved Reports
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={signOut}
          className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
