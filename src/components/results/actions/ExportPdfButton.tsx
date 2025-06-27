
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const ExportPdfButton = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExportReport = async () => {
    setExporting(true);
    try {
      console.log('Generating PDF report...');
      
      // Find the results header and validation results sections only
      const headerElement = document.querySelector('[data-export="results-header"]') as HTMLElement;
      const validationResultsElement = document.querySelector('[data-export="validation-results"]') as HTMLElement;
      
      if (!headerElement || !validationResultsElement) {
        // Fallback: try to find by class names if data attributes aren't found
        const header = document.querySelector('.text-center.mb-12.animate-fade-in') as HTMLElement;
        const results = document.querySelector('.space-y-6.mb-12') as HTMLElement;
        
        if (!header || !results) {
          throw new Error("Could not find the validation report sections to export");
        }
        
        // Create a temporary container with just the content we want
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = '#0f172a';
        tempContainer.style.padding = '32px';
        tempContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        
        // Clone and append the header and results
        const headerClone = header.cloneNode(true) as HTMLElement;
        const resultsClone = results.cloneNode(true) as HTMLElement;
        
        tempContainer.appendChild(headerClone);
        tempContainer.appendChild(resultsClone);
        document.body.appendChild(tempContainer);
        
        // Create canvas from the temporary container
        const canvas = await html2canvas(tempContainer, {
          backgroundColor: '#0f172a',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: tempContainer.scrollHeight
        });
        
        // Remove temporary container
        document.body.removeChild(tempContainer);
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Scale to fit on single page if needed
        if (imgHeight > 295) { // A4 height
          const scale = 295 / imgHeight;
          const scaledWidth = imgWidth * scale;
          const scaledHeight = 295;
          const xOffset = (210 - scaledWidth) / 2;
          pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
        } else {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
        
        // Save the PDF
        pdf.save(`validation-report-${Date.now()}.pdf`);
        
        toast({
          title: "Report exported!",
          description: "Your validation report has been downloaded as a PDF.",
        });
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Error exporting report",
        description: error.message || "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
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
  );
};
