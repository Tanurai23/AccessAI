import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = async (scan: SavedScan): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(`AccessAI Report - ${scan.url}`, 20, 30);
  doc.setFontSize(12);
  doc.text(`Score: ${scan.score}% | Date: ${new Date(scan.date).toLocaleDateString()}`, 20, 45);
  
  // Issues table
  const tableData = scan.issues.map(issue => [
    issue.severity,
    issue.description.slice(0, 50) + '...',
    issue.aiSuggestions?.[0]?.slice(0, 30) + '...'
  ]);
  
  (doc as any).autoTable({
    head: [['Severity', 'Issue', 'AI Fix']],
    body: tableData,
    startY: 60,
    theme: 'grid'
  });
  
  return doc.output('blob');
};

// Download handler (Pro-only)
const exportPDF = async () => {
  if (!isPro || !(await trackUsage('export'))) {
    showUpgrade();
    return;
  }
  
  const pdfBlob = await generatePDF(selectedScan);
  const url = URL.createObjectURL(pdfBlob);
  chrome.downloads.download({
    url,
    filename: `accessai-report-${selectedScan.url.replace(/[^a-z0-9]/gi, '-')}.pdf`,
    saveAs: true
  });
};