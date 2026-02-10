import React from 'react';
import { Badge } from './Badge';

export interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
}

const App: React.FC = () => {
  const [issues, setIssues] = React.useState<AuditIssue[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);

  const scanPage = () => {
    console.log("🚀 Scan button clicked");
    setIsScanning(true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        console.error("❌ No active tab");
        setIsScanning(false);
        return;
      }

      console.log("📤 Sending message to tab:", tabs[0].id);

      chrome.tabs.sendMessage(tabs[0].id, { action: "scan" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Message error:", chrome.runtime.lastError.message);
          setIsScanning(false);
          return;
        }

        console.log("✅ Full response:", response);
        
        const issues = response?.issues || [];
        console.log("📊 Extracted issues:", issues.length);
        
        setIssues(issues);
        setIsScanning(false);
      });
    });
  };

  // Calculate metrics
  const totalIssues = issues.length;
  const severityCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  };

  const wcagRulesCovered = new Set(issues.map(i => i.type)).size;

  return (
    <div className="w-96 p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg shadow-2xl">
      <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
        AccessAI
      </h1>
      
      <button
        onClick={scanPage}
        disabled={isScanning}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isScanning ? '⏳ Scanning...' : '🔍 Scan Current Page'}
      </button>

      {/* METRICS DASHBOARD */}
      {totalIssues > 0 && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-purple-300">📊 Audit Metrics</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-900/50 p-2 rounded text-center">
              <div className="text-2xl font-bold text-white">{totalIssues}</div>
              <div className="text-xs text-slate-400">Total Issues</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded text-center">
              <div className="text-2xl font-bold text-purple-400">{wcagRulesCovered}</div>
              <div className="text-xs text-slate-400">WCAG Rules</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 mb-1">Severity Breakdown:</div>
            
            {severityCounts.critical > 0 && (
              <div className="flex items-center justify-between bg-red-900/20 px-2 py-1 rounded">
                <span className="text-xs text-red-300">🔴 Critical</span>
                <span className="text-sm font-bold text-red-400">{severityCounts.critical}</span>
              </div>
            )}
            
            {severityCounts.high > 0 && (
              <div className="flex items-center justify-between bg-orange-900/20 px-2 py-1 rounded">
                <span className="text-xs text-orange-300">🟠 High</span>
                <span className="text-sm font-bold text-orange-400">{severityCounts.high}</span>
              </div>
            )}
            
            {severityCounts.medium > 0 && (
              <div className="flex items-center justify-between bg-yellow-900/20 px-2 py-1 rounded">
                <span className="text-xs text-yellow-300">🟡 Medium</span>
                <span className="text-sm font-bold text-yellow-400">{severityCounts.medium}</span>
              </div>
            )}
            
            {severityCounts.low > 0 && (
              <div className="flex items-center justify-between bg-green-900/20 px-2 py-1 rounded">
                <span className="text-xs text-green-300">🟢 Low</span>
                <span className="text-sm font-bold text-green-400">{severityCounts.low}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ISSUES LIST */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {issues.length === 0 ? (
          <p className="text-slate-400 text-sm italic text-center py-4">
            {isScanning ? 'Analyzing page...' : 'Click scan to detect accessibility issues'}
          </p>
        ) : (
          issues.map((issue) => (
            <Badge key={issue.id} issue={issue} />
          ))
        )}
      </div>
    </div>
  );
};

export default App;