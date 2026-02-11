import React from 'react';
import { Badge } from './Badge';

export interface AuditIssue {
  id: string;
  type: 'alt' | 'contrast' | 'focus' | 'landmark' | 'heading' | 'form-label' | 'link-text' | 'lang' | 'aria' | 'semantic' | 'keyboard' | 'table';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element: string;
  description: string;
  fixed: boolean;
  aiSuggestion?: string;  // 🔥 NEW: AI Alt Text
}

const App: React.FC = () => {
  const [issues, setIssues] = React.useState<AuditIssue[]>([]);
  const [isScanning, setIsScanning] = React.useState(false);

  // ... [scanPage function UNCHANGED - keep your existing code]

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
  const aiSuggestionsCount = issues.filter(i => i.aiSuggestion).length;  // 🔥 NEW

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

      {/* 🔥 NEW: AI METRICS + shadcn-style Cards */}
      {totalIssues > 0 && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-3 text-purple-300">📊 Audit Metrics</h2>
          
          {/* 🔥 3-COL GRID METRICS CARDS */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-3 rounded-lg border border-red-500/30 text-center">
              <div className="text-xl font-bold text-red-300">{severityCounts.critical}</div>
              <div className="text-xs text-red-200">Critical</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 p-3 rounded-lg border border-orange-500/30 text-center">
              <div className="text-xl font-bold text-orange-300">{severityCounts.high}</div>
              <div className="text-xs text-orange-200">High</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-3 rounded-lg border border-green-500/30 text-center">
              <div className="text-xl font-bold text-green-300">{aiSuggestionsCount}</div>
              <div className="text-xs text-green-200">🤖 AI Fixes</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/50 p-2 rounded text-center">
              <div className="font-bold text-white">{totalIssues}</div>
              <div className="text-slate-400">Total Issues</div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded text-center">
              <div className="font-bold text-purple-400">{wcagRulesCovered}</div>
              <div className="text-slate-400">WCAG Rules</div>
            </div>
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
            <div key={issue.id} className="group">
              <Badge issue={issue} />
              {/* 🔥 AI SUGGESTION DISPLAY */}
              {issue.aiSuggestion && (
                <div className="ml-4 mt-1 p-2 bg-green-900/50 border border-green-500/30 rounded text-xs text-green-200 group-hover:bg-green-800/50 transition-all">
                  💡 AI Fix: "{issue.aiSuggestion}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;