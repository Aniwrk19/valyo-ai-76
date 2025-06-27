
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
      const businessIdea = localStorage.getItem("businessIdea");
      
      if (!businessIdea) {
        throw new Error("Business idea not found");
      }

      console.log('Generating PDF report using html2canvas...');
      
      // Find the main results container
      const resultsContainer = document.querySelector('.w-full.max-w-4xl.mx-auto.py-8');
      
      if (!resultsContainer) {
        throw new Error("Results container not found");
      }

      // Create canvas from the results container
      const canvas = await html2canvas(resultsContainer as HTMLElement, {
        backgroundColor: '#0f172a', // Match the dark background
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        height: resultsContainer.scrollHeight,
        width: resultsContainer.scrollWidth
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`validation-report-${Date.now()}.pdf`);

      toast({
        title: "Report exported!",
        description: "Your validation report has been downloaded as a PDF.",
      });
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
