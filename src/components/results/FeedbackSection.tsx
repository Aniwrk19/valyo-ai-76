
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FeedbackSection = () => {
  const { toast } = useToast();
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(isPositive);
    if (isPositive) {
      setFeedbackText("");
    }
  };

  const handleSubmitFeedback = () => {
    toast({ title: "Thank you for your feedback!" });
  };

  return (
    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
      <h3 className="text-2xl font-bold text-white mb-4 text-center">Was this helpful?</h3>
      <div className="flex justify-center gap-4 mb-4">
        <Button
          onClick={() => handleFeedback(true)}
          variant={feedbackGiven === true ? "default" : "outline"}
          className={`h-12 px-6 ${feedbackGiven === true ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
        >
          <ThumbsUp className="w-5 h-5 mr-2" />
          Yes
        </Button>
        <Button
          onClick={() => handleFeedback(false)}
          variant={feedbackGiven === false ? "default" : "outline"}
          className={`h-12 px-6 ${feedbackGiven === false ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'}`}
        >
          <ThumbsDown className="w-5 h-5 mr-2" />
          No
        </Button>
      </div>
      
      {feedbackGiven === false && (
        <div className="space-y-4">
          <Textarea
            placeholder="What could be improved?"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={handleSubmitFeedback}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Submit Feedback
          </Button>
        </div>
      )}
    </div>
  );
};
